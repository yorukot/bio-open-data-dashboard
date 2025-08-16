import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    if (!year) {
      return NextResponse.json(
        { error: 'year parameter is required' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2012 || yearNum > 2025) {
      return NextResponse.json(
        { error: 'year must be a valid number between 2012 and 2025' },
        { status: 400 }
      );
    }

    const queryText = `
      SELECT 
        county,
        SUM(total_amount) as total_amount
      FROM animal_aggregated_data 
      WHERE year = $1
      GROUP BY county
      ORDER BY total_amount DESC
    `;

    const result = await query(queryText, [yearNum]);

    const data = result.rows.map((row: { county: string; total_amount: string }) => ({
      county: row.county,
      total_amount: parseInt(row.total_amount)
    }));

    return NextResponse.json({
      data,
      year: yearNum
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}