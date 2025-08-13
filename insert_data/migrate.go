package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"
)

// Helper function to determine season from month
func getSeasonFromMonth(month int) int {
	switch {
	case month >= 3 && month <= 5:
		return 1 // Spring
	case month >= 6 && month <= 8:
		return 2 // Summer
	case month >= 9 && month <= 11:
		return 3 // Fall/Autumn
	default:
		return 4 // Winter (12, 1, 2)
	}
}

// migrateToAnimalAggregatedData migrates data from biological_data to animal_aggregated_data
func migrateToAnimalAggregatedData(db *sql.DB) error {
	log.Println("Starting migration to animal_aggregated_data table...")

	// First, ensure the table exists
	if err := createAnimalAggregatedTable(db); err != nil {
		return fmt.Errorf("error creating animal_aggregated_data table: %v", err)
	}

	// Clear existing data in case of re-migration
	if _, err := db.Exec("DELETE FROM animal_aggregated_data"); err != nil {
		log.Printf("Warning: could not clear existing animal_aggregated_data: %v", err)
	}

	// SQL query to aggregate biological data
	query := `
		INSERT INTO animal_aggregated_data 
		(county, animal_type, year, month, season, total_amount, event_count, created_at, updated_at)
		SELECT 
			COALESCE(county, 'Unknown') as county,
			COALESCE(bio_group, 'Unknown') as animal_type,
			EXTRACT(YEAR FROM event_date)::INTEGER as year,
			EXTRACT(MONTH FROM event_date)::INTEGER as month,
			CASE 
				WHEN EXTRACT(MONTH FROM event_date) BETWEEN 3 AND 5 THEN 1
				WHEN EXTRACT(MONTH FROM event_date) BETWEEN 6 AND 8 THEN 2
				WHEN EXTRACT(MONTH FROM event_date) BETWEEN 9 AND 11 THEN 3
				ELSE 4
			END as season,
			COALESCE(SUM(
				CASE 
					WHEN organism_quantity ~ '^[0-9]+$' THEN organism_quantity::INTEGER
					ELSE 1
				END
			), 0) as total_amount,
			COUNT(*) as event_count,
			NOW() as created_at,
			NOW() as updated_at
		FROM biological_data 
		WHERE event_date IS NOT NULL 
			AND EXTRACT(YEAR FROM event_date) IS NOT NULL
			AND EXTRACT(MONTH FROM event_date) BETWEEN 1 AND 12
		GROUP BY 
			COALESCE(county, 'Unknown'),
			COALESCE(bio_group, 'Unknown'),
			EXTRACT(YEAR FROM event_date),
			EXTRACT(MONTH FROM event_date)
		ORDER BY year, month, county, animal_type
	`

	log.Println("Executing animal aggregation query...")
	result, err := db.Exec(query)
	if err != nil {
		return fmt.Errorf("error executing animal aggregation: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Warning: could not get rows affected count: %v", err)
	} else {
		log.Printf("Successfully migrated %d aggregated animal records", rowsAffected)
	}

	return nil
}

// migrateToDatasetStatsAggregated migrates data from biological_data to dataset_stats_aggregated
func migrateToDatasetStatsAggregated(db *sql.DB) error {
	log.Println("Starting migration to dataset_stats_aggregated table...")

	// First, ensure the table exists
	if err := createDatasetStatsTable(db); err != nil {
		return fmt.Errorf("error creating dataset_stats_aggregated table: %v", err)
	}

	// Clear existing data in case of re-migration
	if _, err := db.Exec("DELETE FROM dataset_stats_aggregated"); err != nil {
		log.Printf("Warning: could not clear existing dataset_stats_aggregated: %v", err)
	}

	// SQL query to aggregate dataset statistics
	query := `
		INSERT INTO dataset_stats_aggregated 
		(dataset, county, year, month, count, created_at, updated_at)
		SELECT 
			COALESCE(dataset_name, 'Unknown') as dataset,
			COALESCE(county, 'Unknown') as county,
			EXTRACT(YEAR FROM event_date)::INTEGER as year,
			EXTRACT(MONTH FROM event_date)::INTEGER as month,
			COUNT(*) as count,
			NOW() as created_at,
			NOW() as updated_at
		FROM biological_data 
		WHERE event_date IS NOT NULL 
			AND EXTRACT(YEAR FROM event_date) IS NOT NULL
			AND EXTRACT(MONTH FROM event_date) BETWEEN 1 AND 12
		GROUP BY 
			COALESCE(dataset_name, 'Unknown'),
			COALESCE(county, 'Unknown'),
			EXTRACT(YEAR FROM event_date),
			EXTRACT(MONTH FROM event_date)
		ORDER BY year, month, dataset, county
	`

	log.Println("Executing dataset stats aggregation query...")
	result, err := db.Exec(query)
	if err != nil {
		return fmt.Errorf("error executing dataset stats aggregation: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Warning: could not get rows affected count: %v", err)
	} else {
		log.Printf("Successfully migrated %d aggregated dataset stats records", rowsAffected)
	}

	return nil
}

// runMigration orchestrates the entire migration process
func runMigration(db *sql.DB) error {
	log.Println("=== Starting Data Migration Process ===")
	startTime := time.Now()

	// Check if source table exists and has data
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM biological_data").Scan(&count)
	if err != nil {
		return fmt.Errorf("error checking source data: %v", err)
	}
	
	if count == 0 {
		return fmt.Errorf("no data found in biological_data table to migrate")
	}
	
	log.Printf("Found %d records in biological_data table", count)

	// Step 1: Migrate to animal_aggregated_data
	if err := migrateToAnimalAggregatedData(db); err != nil {
		return fmt.Errorf("animal aggregation migration failed: %v", err)
	}

	// Step 2: Migrate to dataset_stats_aggregated
	if err := migrateToDatasetStatsAggregated(db); err != nil {
		return fmt.Errorf("dataset stats migration failed: %v", err)
	}

	// Verify migrations
	var animalCount, datasetCount int
	db.QueryRow("SELECT COUNT(*) FROM animal_aggregated_data").Scan(&animalCount)
	db.QueryRow("SELECT COUNT(*) FROM dataset_stats_aggregated").Scan(&datasetCount)

	duration := time.Since(startTime)
	log.Printf("=== Migration Completed Successfully ===")
	log.Printf("Duration: %v", duration)
	log.Printf("Animal aggregated records: %d", animalCount)
	log.Printf("Dataset stats records: %d", datasetCount)
	log.Printf("Source biological records: %d", count)

	return nil
}

// migrationHealthCheck performs basic validation on migrated data
func migrationHealthCheck(db *sql.DB) error {
	log.Println("Running migration health check...")

	// Check for any NULL values in critical fields
	queries := []struct {
		name  string
		query string
	}{
		{
			"Animal data with NULL county",
			"SELECT COUNT(*) FROM animal_aggregated_data WHERE county IS NULL",
		},
		{
			"Animal data with invalid months",
			"SELECT COUNT(*) FROM animal_aggregated_data WHERE month < 1 OR month > 12",
		},
		{
			"Animal data with invalid seasons",
			"SELECT COUNT(*) FROM animal_aggregated_data WHERE season < 1 OR season > 4",
		},
		{
			"Dataset stats with NULL dataset",
			"SELECT COUNT(*) FROM dataset_stats_aggregated WHERE dataset IS NULL",
		},
		{
			"Dataset stats with invalid months",
			"SELECT COUNT(*) FROM dataset_stats_aggregated WHERE month < 1 OR month > 12",
		},
	}

	for _, check := range queries {
		var count int
		err := db.QueryRow(check.query).Scan(&count)
		if err != nil {
			log.Printf("Warning: health check failed for %s: %v", check.name, err)
			continue
		}
		if count > 0 {
			log.Printf("Warning: %s found %d problematic records", check.name, count)
		} else {
			log.Printf("✓ %s: OK", check.name)
		}
	}

	return nil
}