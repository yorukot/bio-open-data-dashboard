import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json(
        { error: 'month parameter is required' },
        { status: 400 }
      );
    }

    const monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: 'month must be a valid number between 1 and 12' },
        { status: 400 }
      );
    }

    const queryText = `
      SELECT 
        county,
        SUM(total_amount) as total_amount
      FROM animal_aggregated_data 
      WHERE month = $1
      GROUP BY county
      ORDER BY county
    `;

    const result = await query(queryText, [monthNum]);

    const data = result.rows.map((row: { county: string; total_amount: string }) => ({
      county: row.county,
      total_amount: parseInt(row.total_amount)
    }));

    return NextResponse.json({
      data,
      month: monthNum
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}