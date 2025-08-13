CALL refresh_continuous_aggregate('light_data_1km_hourly', NULL, NULL);

SELECT COUNT(*) FROM light_data_1km_hourly;

DELETE FROM light_data_1km_hourly;

SELECT COUNT(*) FROM light_data_1km_hourly;

SELECT * FROM light_data_1km_hourly ORDER BY bucket DESC LIMIT 5;

SELECT COUNT(*) as total_records
FROM light_data_1km_hourly
WHERE bucket >= '2025-04-30T16:00:00.000Z'::timestamp
  AND bucket <= '2025-06-30T15:59:59.999Z'::timestamp;

DROP MATERIALIZED VIEW IF EXISTS light_data_1km_hourly;

-- Create a continuous aggregate for spatial-temporal bucketing
CREATE MATERIALIZED VIEW light_data_1km_hourly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    -- Snap coordinates to 1km grid (0.007 degrees ≈ 500m)
    ROUND(longitude / 0.006) * 0.006 AS grid_longitude,
    ROUND(latitude / 0.006) * 0.006 AS grid_latitude,
    AVG(brightness) AS avg_brightness,
    COUNT(*) AS point_count,
    MAX(brightness) AS max_brightness,
    MIN(brightness) AS min_brightness
FROM light_data
GROUP BY bucket, grid_longitude, grid_latitude;