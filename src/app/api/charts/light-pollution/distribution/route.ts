import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { LightAggregationRow, CountyLightData } from '@/lib/types/database';

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

    const queryText = `
      SELECT 
        county,
        EXTRACT(MONTH FROM time) as month,
        AVG(brightness) as avg_brightness
      FROM light_data_with_county 
      WHERE 
        time >= $1 
        AND time <= $2
        AND county IS NOT NULL
        AND brightness IS NOT NULL
      GROUP BY county, EXTRACT(MONTH FROM time)
      ORDER BY county, month
    `;

    const result = await query(queryText, [startDate.toISOString(), endDate.toISOString()]);

    const countyMap = new Map<string, CountyLightData>();
    
    result.rows.forEach((row: LightAggregationRow) => {
      const county = row.county;
      const month = parseInt(row.month);
      const avgBrightness = parseFloat(row.avg_brightness);

      if (!countyMap.has(county)) {
        countyMap.set(county, {
          county,
          data: []
        });
      }
      
      countyMap.get(county)!.data.push({
        month,
        light_pollution_average: Math.round(avgBrightness * 100) / 100 // Round to 2 decimal places
      });
    });

    // Sort data by month for each county
    countyMap.forEach((countyData) => {
      countyData.data.sort((a, b) => a.month - b.month);
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