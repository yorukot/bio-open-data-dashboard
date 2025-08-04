package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
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

type BiologicalData struct {
	SourceScientificName string `json:"sourceScientificName"`
	ScientificName       string `json:"scientificName"`
	CommonNameC          string `json:"common_name_c"`
	BioGroup             string `json:"bioGroup"`
	EventDate            string `json:"eventDate"`
	Created              string `json:"created"`
	DatasetName          string `json:"datasetName"`
	BasisOfRecord        string `json:"basisOfRecord"`
	StandardLatitude     string `json:"standardLatitude"`
	StandardLongitude    string `json:"standardLongitude"`
	County               string `json:"county"`
	Municipality         string `json:"municipality"`
	Locality             string `json:"locality"`
	OrganismQuantity     string `json:"organismQuantity"`
	TaxonID              string `json:"taxonID"`
	CatalogNumber        string `json:"catalogNumber"`
	RecordNumber         string `json:"recordNumber"`
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

var pgsql_url = "x"

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

func createBiologicalTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS biological_data (
		id SERIAL PRIMARY KEY,
		source_scientific_name TEXT,
		scientific_name TEXT,
		common_name_c TEXT,
		bio_group TEXT,
		event_date TIMESTAMPTZ,
		created TIMESTAMPTZ,
		dataset_name TEXT,
		basis_of_record TEXT,
		standard_latitude DOUBLE PRECISION,
		standard_longitude DOUBLE PRECISION,
		county TEXT,
		municipality TEXT,
		locality TEXT,
		organism_quantity TEXT,
		taxon_id TEXT,
		catalog_number TEXT,
		record_number TEXT
	);

	CREATE INDEX IF NOT EXISTS idx_biological_data_location ON biological_data (standard_longitude, standard_latitude);
	CREATE INDEX IF NOT EXISTS idx_biological_data_scientific_name ON biological_data (scientific_name);
	CREATE INDEX IF NOT EXISTS idx_biological_data_bio_group ON biological_data (bio_group);
	CREATE INDEX IF NOT EXISTS idx_biological_data_event_date ON biological_data (event_date);
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

func processBiologicalJSONFile(filepath string, db *sql.DB) error {
	log.Printf("Processing biological file: %s", filepath)

	file, err := os.Open(filepath)
	if err != nil {
		return fmt.Errorf("error opening file %s: %v", filepath, err)
	}
	defer file.Close()

	var data []BiologicalData
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&data); err != nil {
		return fmt.Errorf("error decoding biological JSON from %s: %v", filepath, err)
	}

	return insertBiologicalData(db, data)
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

func insertBiologicalData(db *sql.DB, data []BiologicalData) error {
	const batchSize = 1000
	totalRecords := len(data)
	
	for i := 0; i < totalRecords; i += batchSize {
		end := i + batchSize
		if end > totalRecords {
			end = totalRecords
		}
		
		batch := data[i:end]
		if err := insertBiologicalBatch(db, batch); err != nil {
			return fmt.Errorf("error inserting biological batch starting at %d: %v", i, err)
		}
		
		if (i+batchSize)%5000 == 0 || end == totalRecords {
			log.Printf("Inserted %d biological records from current file", end)
		}
	}

	log.Printf("Successfully inserted %d biological records", totalRecords)
	return nil
}

func insertBiologicalBatch(db *sql.DB, batch []BiologicalData) error {
	if len(batch) == 0 {
		return nil
	}

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	valueStrings := make([]string, 0, len(batch))
	valueArgs := make([]interface{}, 0, len(batch)*17)
	
	argIndex := 1
	for _, record := range batch {
		// Parse eventDate and created timestamps
		var eventDate, created *time.Time
		if record.EventDate != "" {
			if t, err := time.Parse(time.RFC3339, record.EventDate); err == nil {
				eventDate = &t
			}
		}
		if record.Created != "" {
			if t, err := time.Parse(time.RFC3339, record.Created); err == nil {
				created = &t
			}
		}

		// Parse coordinates
		var lat, lng *float64
		if record.StandardLatitude != "" && record.StandardLatitude != " " {
			if f, err := strconv.ParseFloat(record.StandardLatitude, 64); err == nil {
				lat = &f
			}
		}
		if record.StandardLongitude != "" && record.StandardLongitude != " " {
			if f, err := strconv.ParseFloat(record.StandardLongitude, 64); err == nil {
				lng = &f
			}
		}
		
		valueStrings = append(valueStrings, fmt.Sprintf("($%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d)", 
			argIndex, argIndex+1, argIndex+2, argIndex+3, argIndex+4, argIndex+5, argIndex+6, argIndex+7, 
			argIndex+8, argIndex+9, argIndex+10, argIndex+11, argIndex+12, argIndex+13, argIndex+14, argIndex+15, argIndex+16))
		
		valueArgs = append(valueArgs, 
			record.SourceScientificName, record.ScientificName, record.CommonNameC, record.BioGroup,
			eventDate, created, record.DatasetName, record.BasisOfRecord,
			lat, lng, record.County, record.Municipality, record.Locality,
			record.OrganismQuantity, record.TaxonID, record.CatalogNumber, record.RecordNumber)
		argIndex += 17
	}
	
	if len(valueStrings) == 0 {
		return nil
	}

	query := fmt.Sprintf(`INSERT INTO biological_data 
		(source_scientific_name, scientific_name, common_name_c, bio_group, event_date, created, 
		 dataset_name, basis_of_record, standard_latitude, standard_longitude, county, municipality, 
		 locality, organism_quantity, taxon_id, catalog_number, record_number) 
		VALUES %s`, strings.Join(valueStrings, ","))
	
	_, err = tx.Exec(query, valueArgs...)
	if err != nil {
		return fmt.Errorf("error executing biological batch insert: %v", err)
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

func biologicalWorker(id int, jobs <-chan string, results chan<- error, stats *ProcessingStats, wg *sync.WaitGroup) {
	defer wg.Done()

	for jobPath := range jobs {
		log.Printf("Biological Worker %d: Processing %s", id, jobPath)
		
		err := processBiologicalJSONFile(jobPath, dbPool)
		if err != nil {
			log.Printf("Biological Worker %d: Error processing %s: %v", id, jobPath, err)
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

func collectBiologicalJobs(dataDir string) ([]string, error) {
	var jobs []string
	
	err := filepath.Walk(dataDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !strings.HasSuffix(info.Name(), ".json") {
			return nil
		}

		jobs = append(jobs, path)
		return nil
	})
	
	return jobs, err
}

func processBiologicalFilesConcurrently(dataDir string, numWorkers int) error {
	// Collect all jobs first
	jobs, err := collectBiologicalJobs(dataDir)
	if err != nil {
		return fmt.Errorf("error collecting biological jobs: %v", err)
	}
	
	if len(jobs) == 0 {
		log.Println("No biological JSON files found to process")
		return nil
	}
	
	log.Printf("Found %d biological files to process with %d workers", len(jobs), numWorkers)
	
	// Create channels
	jobChan := make(chan string, len(jobs))
	resultChan := make(chan error, len(jobs))
	
	// Initialize stats
	stats := &ProcessingStats{}
	
	// Start workers
	var wg sync.WaitGroup
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go biologicalWorker(i, jobChan, resultChan, stats, &wg)
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
				log.Printf("Progress: %d/%d biological files processed, %d errors", processed, len(jobs), errors)
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
	
	log.Printf("Biological processing completed: %d files processed successfully, %d errors", processed, errorCount)
	
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
	// Parse command line arguments
	processBiological := false
	if len(os.Args) > 1 && os.Args[1] == "final_dataset" {
		processBiological = true
		log.Println("Mode: Processing biological data from TBIA_final_dataset")
	} else {
		log.Println("Mode: Processing light pollution data (default)")
		log.Println("Usage: go run main.go [final_dataset]")
		log.Println("  - No arguments: Process light pollution data")
		log.Println("  - final_dataset: Process TBIA biological data")
	}

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

	var dataDir string
	numWorkers := 16

	if processBiological {
		// Create biological table
		if err := createBiologicalTable(dbPool); err != nil {
			log.Fatalf("Error creating biological table: %v", err)
		}
		log.Println("Biological table created successfully")
		
		dataDir = "../light_taiwan/TBIA_final_dataset"
		log.Printf("Starting biological data processing with %d workers", numWorkers)
		startTime := time.Now()
		
		if err := processBiologicalFilesConcurrently(dataDir, numWorkers); err != nil {
			log.Fatalf("Error processing biological files: %v", err)
		}
		
		duration := time.Since(startTime)
		log.Printf("Biological data import completed successfully in %v", duration)
	} else {
		// Create light data table
		if err := createTable(dbPool); err != nil {
			log.Fatalf("Error creating light table: %v", err)
		}
		log.Println("Light table created successfully")

		dataDir = "../light_taiwan"
		log.Printf("Starting light data processing with %d workers", numWorkers)
		startTime := time.Now()
		
		if err := processAllFilesConcurrently(dataDir, numWorkers); err != nil {
			log.Fatalf("Error processing light files: %v", err)
		}
		
		duration := time.Since(startTime)
		log.Printf("Light data import completed successfully in %v", duration)
	}
}
