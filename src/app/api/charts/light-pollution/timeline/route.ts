import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { LightAggregationRow, CountyLightData } from '@/lib/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const county = searchParams.get('county');
    const year = searchParams.get('year');

    if (!county) {
      return NextResponse.json(
        { error: 'county parameter is required' },
        { status: 400 }
      );
    }

    if (!year) {
      return NextResponse.json(
        { error: 'year parameter is required' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return NextResponse.json(
        { error: 'Invalid year format. Must be a valid year between 1900 and 2100' },
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
        EXTRACT(YEAR FROM time) = $1
        AND county = $2
        AND brightness IS NOT NULL
      GROUP BY county, EXTRACT(MONTH FROM time)
      ORDER BY month
    `;

    const result = await query(queryText, [yearNum, county]);

    const data: Array<{ month: number; light_pollution_average: number }> = [];
    
    result.rows.forEach((row: LightAggregationRow) => {
      const month = parseInt(row.month);
      const avgBrightness = parseFloat(row.avg_brightness);

      data.push({
        month,
        light_pollution_average: Math.round(avgBrightness * 100) / 100 // Round to 2 decimal places
      });
    });

    // Sort by month
    data.sort((a, b) => a.month - b.month);

    const response: CountyLightData = {
      county,
      data
    };

    return NextResponse.json({
      ...response,
      year: yearNum,
      total_months: data.length
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}