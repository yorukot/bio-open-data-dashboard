package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	_ "github.com/lib/pq" // Postgres driver, imported for side-effects
)

type LightData struct {
	Time       time.Time `json:"-"`
	Longitude  float64   `json:"-"`
	Latitude   float64   `json:"-"`
	Brightness float64   `json:"-"`
}

type FileJob struct {
	FilePath  string
	Timestamp time.Time
}

type ProcessingStats struct {
	FilesProcessed int64
	RecordsInserted int64
	ErrorCount int64
}

var pgsql_url = ""

var dbPool *sql.DB

func createTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS light_data (
		time TIMESTAMPTZ NOT NULL,
		longitude DOUBLE PRECISION NOT NULL,
		latitude DOUBLE PRECISION NOT NULL,
		brightness DOUBLE PRECISION NOT NULL
	);

	SELECT create_hypertable('light_data', 'time', if_not_exists => TRUE);

	CREATE INDEX IF NOT EXISTS idx_light_data_location ON light_data (longitude, latitude);
	CREATE INDEX IF NOT EXISTS idx_light_data_brightness ON light_data (brightness);
	`

	_, err := db.Exec(query)
	return err
}

func parseTimeFromFilename(filename string) (time.Time, error) {
	parts := strings.Split(filename, "_")
	if len(parts) < 3 {
		return time.Time{}, fmt.Errorf("invalid filename format: %s", filename)
	}

	timeStr := parts[2]
	timeStr = strings.Replace(timeStr, ".json", "", 1)

	return time.Parse("200601", timeStr)
}

func processJSONFile(filepath string, timestamp time.Time, db *sql.DB) error {
	log.Printf("Processing file: %s", filepath)

	file, err := os.Open(filepath)
	if err != nil {
		return fmt.Errorf("error opening file %s: %v", filepath, err)
	}
	defer file.Close()

	var data [][]float64
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&data); err != nil {
		return fmt.Errorf("error decoding JSON from %s: %v", filepath, err)
	}

	return insertLightData(db, data, timestamp)
}

func insertLightData(db *sql.DB, data [][]float64, timestamp time.Time) error {
	const batchSize = 5000
	totalRecords := len(data)
	
	for i := 0; i < totalRecords; i += batchSize {
		end := i + batchSize
		if end > totalRecords {
			end = totalRecords
		}
		
		batch := data[i:end]
		if err := insertBatch(db, batch, timestamp); err != nil {
			return fmt.Errorf("error inserting batch starting at %d: %v", i, err)
		}
		
		if (i+batchSize)%10000 == 0 || end == totalRecords {
			log.Printf("Inserted %d records from current file", end)
		}
	}

	log.Printf("Successfully inserted %d records", totalRecords)
	return nil
}

func insertBatch(db *sql.DB, batch [][]float64, timestamp time.Time) error {
	if len(batch) == 0 {
		return nil
	}

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	// Build bulk insert query
	valueStrings := make([]string, 0, len(batch))
	valueArgs := make([]interface{}, 0, len(batch)*4)
	
	argIndex := 1
	for _, record := range batch {
		if len(record) != 3 {
			continue
		}
		
		valueStrings = append(valueStrings, fmt.Sprintf("($%d, $%d, $%d, $%d)", argIndex, argIndex+1, argIndex+2, argIndex+3))
		valueArgs = append(valueArgs, timestamp, record[0], record[1], record[2])
		argIndex += 4
	}
	
	if len(valueStrings) == 0 {
		return nil
	}

	query := fmt.Sprintf("INSERT INTO light_data (time, longitude, latitude, brightness) VALUES %s", strings.Join(valueStrings, ","))
	
	_, err = tx.Exec(query, valueArgs...)
	if err != nil {
		return fmt.Errorf("error executing batch insert: %v", err)
	}

	return tx.Commit()
}

func worker(id int, jobs <-chan FileJob, results chan<- error, stats *ProcessingStats, wg *sync.WaitGroup) {
	defer wg.Done()

	for job := range jobs {
		log.Printf("Worker %d: Processing %s", id, job.FilePath)
		
		err := processJSONFile(job.FilePath, job.Timestamp, dbPool)
		if err != nil {
			log.Printf("Worker %d: Error processing %s: %v", id, job.FilePath, err)
			atomic.AddInt64(&stats.ErrorCount, 1)
			results <- err
		} else {
			atomic.AddInt64(&stats.FilesProcessed, 1)
			results <- nil
		}
	}
}

func collectJobs(dataDir string) ([]FileJob, error) {
	var jobs []FileJob
	
	err := filepath.Walk(dataDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !strings.HasSuffix(info.Name(), ".json") {
			return nil
		}

		timestamp, err := parseTimeFromFilename(info.Name())
		if err != nil {
			log.Printf("Skipping file with invalid timestamp: %s (%v)", info.Name(), err)
			return nil
		}

		jobs = append(jobs, FileJob{
			FilePath:  path,
			Timestamp: timestamp,
		})
		return nil
	})
	
	return jobs, err
}

func processAllFilesConcurrently(dataDir string, numWorkers int) error {
	// Collect all jobs first
	jobs, err := collectJobs(dataDir)
	if err != nil {
		return fmt.Errorf("error collecting jobs: %v", err)
	}
	
	if len(jobs) == 0 {
		log.Println("No JSON files found to process")
		return nil
	}
	
	log.Printf("Found %d files to process with %d workers", len(jobs), numWorkers)
	
	// Create channels
	jobChan := make(chan FileJob, len(jobs))
	resultChan := make(chan error, len(jobs))
	
	// Initialize stats
	stats := &ProcessingStats{}
	
	// Start workers
	var wg sync.WaitGroup
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go worker(i, jobChan, resultChan, stats, &wg)
	}
	
	// Send jobs
	go func() {
		for _, job := range jobs {
			jobChan <- job
		}
		close(jobChan)
	}()
	
	// Start progress reporter
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()
		
		for {
			select {
			case <-ticker.C:
				processed := atomic.LoadInt64(&stats.FilesProcessed)
				errors := atomic.LoadInt64(&stats.ErrorCount)
				log.Printf("Progress: %d/%d files processed, %d errors", processed, len(jobs), errors)
				if processed+errors >= int64(len(jobs)) {
					return
				}
			}
		}
	}()
	
	// Wait for workers to complete
	wg.Wait()
	
	// Collect results
	close(resultChan)
	var errors []error
	for result := range resultChan {
		if result != nil {
			errors = append(errors, result)
		}
	}
	
	processed := atomic.LoadInt64(&stats.FilesProcessed)
	errorCount := atomic.LoadInt64(&stats.ErrorCount)
	
	log.Printf("Processing completed: %d files processed successfully, %d errors", processed, errorCount)
	
	if len(errors) > 0 {
		log.Printf("First few errors:")
		for i, err := range errors {
			if i >= 5 { // Show only first 5 errors
				break
			}
			log.Printf("  %d: %v", i+1, err)
		}
	}
	
	return nil
}

func main() {
	var err error
	dbPool, err = sql.Open("postgres", pgsql_url)
	if err != nil {
		log.Fatal(err)
	} else {
		log.Println("Connected to PostgreSQL")
	}
	defer dbPool.Close()

	// Configure connection pool for better performance
	dbPool.SetMaxOpenConns(25)
	dbPool.SetMaxIdleConns(10)
	dbPool.SetConnMaxLifetime(5 * time.Minute)

	if err := createTable(dbPool); err != nil {
		log.Fatalf("Error creating table: %v", err)
	}
	log.Println("Table created successfully")

	dataDir := "../light_taiwan"
	numWorkers := 16 // Increased workers for better throughput
	
	log.Printf("Starting concurrent processing with %d workers", numWorkers)
	startTime := time.Now()
	
	if err := processAllFilesConcurrently(dataDir, numWorkers); err != nil {
		log.Fatalf("Error processing files: %v", err)
	}
	
	duration := time.Since(startTime)
	log.Printf("Data import completed successfully in %v", duration)
}
