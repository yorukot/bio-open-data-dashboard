package main

import (
	"database/sql"
	"time"
)

type AnimalAggregatedData struct {
	ID          int       `json:"-"`
	County      string    `json:"county"`
	AnimalType  string    `json:"animal_type"`
	Year        int       `json:"year"`
	Month       int       `json:"month"`
	Season      int       `json:"season"`
	TotalAmount int       `json:"total_amount"`
	EventCount  int       `json:"event_count"`
	CreatedAt   time.Time `json:"-"`
	UpdatedAt   time.Time `json:"-"`
}

type DatasetStatsAggregated struct {
	ID        int       `json:"-"`
	Dataset   string    `json:"dataset"`
	County    string    `json:"county"`
	Year      int       `json:"year"`
	Month     int       `json:"month"`
	Count     int       `json:"count"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}


func createAnimalAggregatedTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS animal_aggregated_data (
		id SERIAL PRIMARY KEY,
		county TEXT NOT NULL,
		animal_type TEXT NOT NULL,
		year INTEGER NOT NULL,
		month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
		season INTEGER NOT NULL CHECK (season >= 1 AND season <= 4),
		total_amount INTEGER NOT NULL DEFAULT 0,
		event_count INTEGER NOT NULL DEFAULT 0,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	);

	CREATE INDEX IF NOT EXISTS idx_animal_agg_county ON animal_aggregated_data (county);
	CREATE INDEX IF NOT EXISTS idx_animal_agg_animal_type ON animal_aggregated_data (animal_type);
	CREATE INDEX IF NOT EXISTS idx_animal_agg_year_month ON animal_aggregated_data (year, month);
	CREATE INDEX IF NOT EXISTS idx_animal_agg_season ON animal_aggregated_data (season);
	CREATE UNIQUE INDEX IF NOT EXISTS idx_animal_agg_unique ON animal_aggregated_data (county, animal_type, year, month);
	`

	_, err := db.Exec(query)
	return err
}

func createDatasetStatsTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS dataset_stats_aggregated (
		id SERIAL PRIMARY KEY,
		dataset TEXT NOT NULL,
		county TEXT NOT NULL,
		year INTEGER NOT NULL,
		month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
		count INTEGER NOT NULL DEFAULT 0,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	);

	CREATE INDEX IF NOT EXISTS idx_dataset_stats_dataset ON dataset_stats_aggregated (dataset);
	CREATE INDEX IF NOT EXISTS idx_dataset_stats_county ON dataset_stats_aggregated (county);
	CREATE INDEX IF NOT EXISTS idx_dataset_stats_year_month ON dataset_stats_aggregated (year, month);
	CREATE UNIQUE INDEX IF NOT EXISTS idx_dataset_stats_unique ON dataset_stats_aggregated (dataset, county, year, month);
	`

	_, err := db.Exec(query)
	return err
}

func createLightDataWithCountyTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS light_data_with_county (
		id SERIAL PRIMARY KEY,
		time TIMESTAMPTZ NOT NULL,
		longitude DOUBLE PRECISION NOT NULL,
		latitude DOUBLE PRECISION NOT NULL,
		brightness DOUBLE PRECISION,
		county TEXT
	);

	CREATE INDEX IF NOT EXISTS idx_light_data_with_county_time ON light_data_with_county (time);
	CREATE INDEX IF NOT EXISTS idx_light_data_with_county_location ON light_data_with_county (longitude, latitude);
	CREATE INDEX IF NOT EXISTS idx_light_data_with_county_county ON light_data_with_county (county);
	CREATE INDEX IF NOT EXISTS idx_light_data_with_county_brightness ON light_data_with_county (brightness);
	CREATE INDEX IF NOT EXISTS idx_light_data_with_county_time_county ON light_data_with_county (time, county);
	`

	_, err := db.Exec(query)
	return err
}