package main

import (
	"fmt"
	"math"
	"time"
)

// LightData represents a single brightness measurement point
type LightData struct {
	Time       time.Time `json:"-"`
	Longitude  float64   `json:"-"`
	Latitude   float64   `json:"-"`
	Brightness float64   `json:"-"`
}

// AggregatedLightData represents aggregated brightness data for a grid cell and time bucket
type AggregatedLightData struct {
	GridLongitude float64   `json:"grid_longitude" db:"grid_longitude"`
	GridLatitude  float64   `json:"grid_latitude" db:"grid_latitude"`
	TimeBucket    time.Time `json:"time_bucket" db:"time_bucket"`
	AvgBrightness float64   `json:"avg_brightness" db:"avg_brightness"`
	MinBrightness float64   `json:"min_brightness" db:"min_brightness"`
	MaxBrightness float64   `json:"max_brightness" db:"max_brightness"`
	Count         int       `json:"count" db:"count"`
}

// BoundingBox represents geographic bounds for filtering
type BoundingBox struct {
	MinLongitude float64 `json:"min_longitude"`
	MaxLongitude float64 `json:"max_longitude"`
	MinLatitude  float64 `json:"min_latitude"`
	MaxLatitude  float64 `json:"max_latitude"`
}

// TimeRange represents temporal bounds for filtering
type TimeRange struct {
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

// AggregationConfig defines parameters for data aggregation
type AggregationConfig struct {
	SpatialResolutionKm float64       `json:"spatial_resolution_km"`
	TemporalInterval    time.Duration `json:"temporal_interval"`
	AggregationMethod   string        `json:"aggregation_method"` // "average", "sum", "max", "min"
	FilterBounds        *BoundingBox  `json:"filter_bounds,omitempty"`
	TimeRange           *TimeRange    `json:"time_range,omitempty"`
}

// GridCoordinate represents a snapped grid coordinate
type GridCoordinate struct {
	Longitude float64 `json:"longitude"`
	Latitude  float64 `json:"latitude"`
}

// SpatialAggregator handles spatial grid snapping and aggregation
type SpatialAggregator struct {
	config *AggregationConfig
}

// NewSpatialAggregator creates a new spatial aggregator with the given configuration
func NewSpatialAggregator(config *AggregationConfig) *SpatialAggregator {
	return &SpatialAggregator{
		config: config,
	}
}

// calculateGridSize converts kilometers to degrees at the given latitude
// Uses approximate conversion: 1 degree ≈ 111 km at equator
func (sa *SpatialAggregator) calculateGridSize(latitude float64) (lonGridSize, latGridSize float64) {
	const kmPerDegreeLat = 111.0
	latGridSize = sa.config.SpatialResolutionKm / kmPerDegreeLat
	
	// Longitude grid size varies with latitude due to Earth's curvature
	kmPerDegreeLon := kmPerDegreeLat * math.Cos(latitude*math.Pi/180)
	lonGridSize = sa.config.SpatialResolutionKm / kmPerDegreeLon
	
	return lonGridSize, latGridSize
}

// snapToGrid snaps coordinates to the nearest grid point
func (sa *SpatialAggregator) snapToGrid(longitude, latitude float64) GridCoordinate {
	lonGridSize, latGridSize := sa.calculateGridSize(latitude)
	
	// Snap to grid center
	gridLon := math.Round(longitude/lonGridSize) * lonGridSize
	gridLat := math.Round(latitude/latGridSize) * latGridSize
	
	return GridCoordinate{
		Longitude: math.Round(gridLon*1000000) / 1000000, // 6 decimal places
		Latitude:  math.Round(gridLat*1000000) / 1000000,  // 6 decimal places
	}
}

// TemporalAggregator handles time bucketing
type TemporalAggregator struct {
	config *AggregationConfig
}

// NewTemporalAggregator creates a new temporal aggregator
func NewTemporalAggregator(config *AggregationConfig) *TemporalAggregator {
	return &TemporalAggregator{
		config: config,
	}
}

// snapToBucket snaps a timestamp to the appropriate time bucket
func (ta *TemporalAggregator) snapToBucket(timestamp time.Time) time.Time {
	// Get the duration in nanoseconds
	intervalNanos := ta.config.TemporalInterval.Nanoseconds()
	
	// Convert timestamp to nanoseconds since Unix epoch
	timestampNanos := timestamp.UnixNano()
	
	// Calculate the bucket start
	bucketStartNanos := (timestampNanos / intervalNanos) * intervalNanos
	
	return time.Unix(0, bucketStartNanos).UTC()
}

// DataAggregator combines spatial and temporal aggregation
type DataAggregator struct {
	spatialAgg  *SpatialAggregator
	temporalAgg *TemporalAggregator
	config      *AggregationConfig
}

// NewDataAggregator creates a new data aggregator
func NewDataAggregator(config *AggregationConfig) *DataAggregator {
	return &DataAggregator{
		spatialAgg:  NewSpatialAggregator(config),
		temporalAgg: NewTemporalAggregator(config),
		config:      config,
	}
}

// aggregationKey represents a unique key for spatial-temporal aggregation
type aggregationKey struct {
	GridLongitude float64
	GridLatitude  float64
	TimeBucket    int64 // Unix timestamp of bucket start
}

// AggregationAccumulator tracks running statistics for an aggregation group
type AggregationAccumulator struct {
	Sum   float64
	Min   float64
	Max   float64
	Count int
}

// Add incorporates a new brightness value into the accumulator
func (acc *AggregationAccumulator) Add(brightness float64) {
	if acc.Count == 0 {
		acc.Min = brightness
		acc.Max = brightness
		acc.Sum = brightness
		acc.Count = 1
	} else {
		acc.Sum += brightness
		acc.Count++
		if brightness < acc.Min {
			acc.Min = brightness
		}
		if brightness > acc.Max {
			acc.Max = brightness
		}
	}
}

// Average calculates the average brightness
func (acc *AggregationAccumulator) Average() float64 {
	if acc.Count == 0 {
		return 0
	}
	return acc.Sum / float64(acc.Count)
}

// shouldIncludePoint checks if a point should be included based on filters
func (da *DataAggregator) shouldIncludePoint(data LightData) bool {
	// Check spatial bounds
	if da.config.FilterBounds != nil {
		bounds := da.config.FilterBounds
		if data.Longitude < bounds.MinLongitude || data.Longitude > bounds.MaxLongitude ||
			data.Latitude < bounds.MinLatitude || data.Latitude > bounds.MaxLatitude {
			return false
		}
	}
	
	// Check temporal bounds
	if da.config.TimeRange != nil {
		timeRange := da.config.TimeRange
		if data.Time.Before(timeRange.Start) || data.Time.After(timeRange.End) {
			return false
		}
	}
	
	return true
}

// AggregateData performs spatial-temporal aggregation on a slice of LightData
func (da *DataAggregator) AggregateData(data []LightData) []AggregatedLightData {
	aggregates := make(map[aggregationKey]*AggregationAccumulator)
	
	// Process each data point
	for _, point := range data {
		if !da.shouldIncludePoint(point) {
			continue
		}
		
		// Snap to spatial grid
		gridCoord := da.spatialAgg.snapToGrid(point.Longitude, point.Latitude)
		
		// Snap to temporal bucket
		timeBucket := da.temporalAgg.snapToBucket(point.Time)
		
		// Create aggregation key
		key := aggregationKey{
			GridLongitude: gridCoord.Longitude,
			GridLatitude:  gridCoord.Latitude,
			TimeBucket:    timeBucket.Unix(),
		}
		
		// Add to accumulator
		if _, exists := aggregates[key]; !exists {
			aggregates[key] = &AggregationAccumulator{}
		}
		aggregates[key].Add(point.Brightness)
	}
	
	// Convert to result format
	results := make([]AggregatedLightData, 0, len(aggregates))
	for key, acc := range aggregates {
		result := AggregatedLightData{
			GridLongitude: key.GridLongitude,
			GridLatitude:  key.GridLatitude,
			TimeBucket:    time.Unix(key.TimeBucket, 0).UTC(),
			AvgBrightness: acc.Average(),
			MinBrightness: acc.Min,
			MaxBrightness: acc.Max,
			Count:         acc.Count,
		}
		
		results = append(results, result)
	}
	
	return results
}

// StreamingAggregator handles real-time data aggregation with memory efficiency
type StreamingAggregator struct {
	aggregator  *DataAggregator
	buffer      []LightData
	bufferSize  int
	outputChan  chan []AggregatedLightData
	windowSize  time.Duration
	lastFlush   time.Time
}

// NewStreamingAggregator creates a streaming aggregator for real-time processing
func NewStreamingAggregator(config *AggregationConfig, bufferSize int, windowSize time.Duration) *StreamingAggregator {
	return &StreamingAggregator{
		aggregator:  NewDataAggregator(config),
		buffer:      make([]LightData, 0, bufferSize),
		bufferSize:  bufferSize,
		outputChan:  make(chan []AggregatedLightData, 10),
		windowSize:  windowSize,
		lastFlush:   time.Now(),
	}
}

// AddPoint adds a new data point to the streaming aggregator
func (sa *StreamingAggregator) AddPoint(data LightData) {
	sa.buffer = append(sa.buffer, data)
	
	// Check if we should flush based on buffer size or time window
	now := time.Now()
	shouldFlush := len(sa.buffer) >= sa.bufferSize || 
		now.Sub(sa.lastFlush) >= sa.windowSize
	
	if shouldFlush {
		sa.flush()
	}
}

// flush processes the current buffer and sends results to output channel
func (sa *StreamingAggregator) flush() {
	if len(sa.buffer) == 0 {
		return
	}
	
	// Process buffer
	results := sa.aggregator.AggregateData(sa.buffer)
	
	// Send results (non-blocking)
	select {
	case sa.outputChan <- results:
	default:
		// Channel is full, skip this batch
		fmt.Printf("Warning: Output channel full, dropping %d aggregated points\n", len(results))
	}
	
	// Clear buffer
	sa.buffer = sa.buffer[:0]
	sa.lastFlush = time.Now()
}

// GetOutputChannel returns the channel for receiving aggregated results
func (sa *StreamingAggregator) GetOutputChannel() <-chan []AggregatedLightData {
	return sa.outputChan
}

// Close finalizes the streaming aggregator
func (sa *StreamingAggregator) Close() {
	sa.flush()
	close(sa.outputChan)
}

// DefaultConfigurations provides common aggregation configurations
var (
	// HighResolutionConfig: 500m grid, 15-minute intervals
	HighResolutionConfig = &AggregationConfig{
		SpatialResolutionKm: 0.5,
		TemporalInterval:    15 * time.Minute,
		AggregationMethod:   "average",
	}
	
	// MediumResolutionConfig: 1km grid, 1-hour intervals
	MediumResolutionConfig = &AggregationConfig{
		SpatialResolutionKm: 1.0,
		TemporalInterval:    time.Hour,
		AggregationMethod:   "average",
	}
	
	// LowResolutionConfig: 5km grid, daily intervals
	LowResolutionConfig = &AggregationConfig{
		SpatialResolutionKm: 5.0,
		TemporalInterval:    24 * time.Hour,
		AggregationMethod:   "average",
	}
)