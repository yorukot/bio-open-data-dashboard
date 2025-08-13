import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const animalType = searchParams.get('animal_type');
    const year = searchParams.get('year');

    if (!animalType) {
      return NextResponse.json(
        { error: 'animal_type parameter is required' },
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
    if (isNaN(yearNum)) {
      return NextResponse.json(
        { error: 'year must be a valid number' },
        { status: 400 }
      );
    }

    const queryText = `
      SELECT 
        month,
        SUM(event_count) as event_count
      FROM animal_aggregated_data 
      WHERE animal_type = $1 AND year = $2
      GROUP BY month
      ORDER BY month
    `;

    const result = await query(queryText, [animalType, yearNum]);

    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthData = result.rows.find((row: { month: number; event_count: string }) => row.month === month);
      monthlyData.push({
        month,
        event_count: monthData ? parseInt(monthData.event_count) : 0
      });
    }

    return NextResponse.json({
      data: monthlyData,
      animal_type: animalType,
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