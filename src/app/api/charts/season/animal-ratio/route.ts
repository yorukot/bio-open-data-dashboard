import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AnimalAggregatedRow, DatabaseParams } from '@/lib/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const season = searchParams.get('season');
    const county = searchParams.get('county');

    if (!year) {
      return NextResponse.json(
        { error: 'year parameter is required' },
        { status: 400 }
      );
    }

    if (!season) {
      return NextResponse.json(
        { error: 'season parameter is required' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);
    const seasonNum = parseInt(season);

    if (isNaN(yearNum)) {
      return NextResponse.json(
        { error: 'year must be a valid number' },
        { status: 400 }
      );
    }

    if (isNaN(seasonNum) || seasonNum < 1 || seasonNum > 4) {
      return NextResponse.json(
        { error: 'season must be a valid number between 1 and 4' },
        { status: 400 }
      );
    }

    let queryText: string;
    let queryParams: DatabaseParams;

    if (county && county !== 'all') {
      queryText = `
        SELECT 
          county,
          animal_type,
          SUM(total_amount) as total_amount,
          SUM(event_count) as event_count
        FROM animal_aggregated_data 
        WHERE year = $1 AND season = $2 AND county = $3
        GROUP BY county, animal_type
        ORDER BY county, animal_type
      `;
      queryParams = [yearNum, seasonNum, county];
    } else {
      queryText = `
        SELECT 
          county,
          animal_type,
          SUM(total_amount) as total_amount,
          SUM(event_count) as event_count
        FROM animal_aggregated_data 
        WHERE year = $1 AND season = $2
        GROUP BY county, animal_type
        ORDER BY county, animal_type
      `;
      queryParams = [yearNum, seasonNum];
    }

    const result = await query(queryText, queryParams);

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
      year: yearNum,
      season: seasonNum,
      county: county || 'all'
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}