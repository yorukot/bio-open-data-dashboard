import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AnimalAggregatedRow } from '@/lib/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startTime = searchParams.get('start_time');
    const endTime = searchParams.get('end_time');

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'start_time and end_time parameters are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)' },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'start_time must be before end_time' },
        { status: 400 }
      );
    }

    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const endMonth = endDate.getMonth() + 1;

    const queryText = `
      SELECT 
        county,
        animal_type,
        SUM(total_amount) as total_amount,
        SUM(event_count) as event_count
      FROM animal_aggregated_data 
      WHERE 
        (year > $1 OR (year = $1 AND month >= $2))
        AND (year < $3 OR (year = $3 AND month <= $4))
      GROUP BY county, animal_type
      ORDER BY county, animal_type
    `;

    const result = await query(queryText, [startYear, startMonth, endYear, endMonth]);

    const countyMap = new Map();
    
    result.rows.forEach((row: AnimalAggregatedRow) => {
      if (!countyMap.has(row.county)) {
        countyMap.set(row.county, {
          county: row.county,
          animals: []
        });
      }
      
      countyMap.get(row.county).animals.push({
        animal_type: row.animal_type,
        total_amount: parseInt(row.total_amount),
        event_count: parseInt(row.event_count)
      });
    });

    const data = Array.from(countyMap.values());

    return NextResponse.json({
      data,
      time_range: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}