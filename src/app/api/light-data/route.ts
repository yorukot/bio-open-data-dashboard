import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startTime = searchParams.get('start_time');
    const endTime = searchParams.get('end_time');
    const limit = searchParams.get('limit') || '1000';
    const offset = searchParams.get('offset') || '0';

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

    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 10000) {
      return NextResponse.json(
        { error: 'limit must be a number between 1 and 10000' },
        { status: 400 }
      );
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      return NextResponse.json(
        { error: 'offset must be a non-negative number' },
        { status: 400 }
      );
    }

    const queryText = `
      SELECT 
        time,
        longitude,
        latitude,
        brightness
      FROM light_data 
      WHERE time >= $1 AND time <= $2
      ORDER BY time ASC
      LIMIT $3 OFFSET $4
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM light_data 
      WHERE time >= $1 AND time <= $2
    `;

    const [dataResult, countResult] = await Promise.all([
      query(queryText, [startDate, endDate, limitNum, offsetNum]),
      query(countQuery, [startDate, endDate])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const hasMore = offsetNum + limitNum < total;

    return NextResponse.json({
      data: dataResult.rows,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        has_more: hasMore
      },
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