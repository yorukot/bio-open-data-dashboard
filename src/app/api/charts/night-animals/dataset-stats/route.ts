import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { DatabaseParams } from '@/lib/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const county = searchParams.get('county');

    let queryText: string;
    let queryParams: DatabaseParams;

    if (county && county !== 'all') {
      queryText = `
        SELECT 
          dataset,
          SUM(count) as count
        FROM dataset_stats_aggregated 
        WHERE county = $1
        GROUP BY dataset
        ORDER BY count DESC
      `;
      queryParams = [county];
    } else {
      queryText = `
        SELECT 
          dataset,
          SUM(count) as count
        FROM dataset_stats_aggregated 
        GROUP BY dataset
        ORDER BY count DESC
      `;
      queryParams = [];
    }

    const result = await query(queryText, queryParams);

    const data = result.rows.map((row: { dataset: string; count: string }) => ({
      dataset: row.dataset,
      count: parseInt(row.count)
    }));

    return NextResponse.json({
      data,
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