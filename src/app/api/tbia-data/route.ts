import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Time filters (required with defaults)
    const startTime = searchParams.get('start_time') || '2020-01-01T00:00:00Z';
    const endTime = searchParams.get('end_time') || new Date().toISOString();

    // Optional filters
    const bioGroup = searchParams.get('bio_group');
    const commonNameC = searchParams.get('common_name_c');
    const county = searchParams.get('county');
    const municipality = searchParams.get('municipality');
    const locality = searchParams.get('locality');

    // Pagination parameters
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset') || '0';

    // Validate time parameters
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

    // Validate pagination parameters
    const offsetNum = parseInt(offset);
    let limitNum: number | null = null;

    if (limit !== null) {
      limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum <= 0) {
        return NextResponse.json(
          { error: 'limit must be a positive number' },
          { status: 400 }
        );
      }
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      return NextResponse.json(
        { error: 'offset must be a non-negative number' },
        { status: 400 }
      );
    }

    // Build dynamic query
    let queryText = `
      SELECT 
        id,
        source_scientific_name,
        scientific_name,
        common_name_c,
        bio_group,
        event_date,
        created,
        dataset_name,
        basis_of_record,
        standard_latitude,
        standard_longitude,
        county,
        municipality,
        locality,
        organism_quantity,
        taxon_id,
        catalog_number,
        record_number
      FROM biological_data 
      WHERE event_date >= $1 AND event_date <= $2
    `;

    const queryParams: (string | number)[] = [startDate.toISOString(), endDate.toISOString()];
    let paramIndex = 3;

    // Add optional filters
    if (bioGroup) {
      queryText += ` AND bio_group = $${paramIndex}`;
      queryParams.push(bioGroup);
      paramIndex++;
    }

    if (commonNameC) {
      queryText += ` AND common_name_c ILIKE $${paramIndex}`;
      queryParams.push(`%${commonNameC}%`);
      paramIndex++;
    }

    if (county) {
      queryText += ` AND county ILIKE $${paramIndex}`;
      queryParams.push(`%${county}%`);
      paramIndex++;
    }

    if (municipality) {
      queryText += ` AND municipality ILIKE $${paramIndex}`;
      queryParams.push(`%${municipality}%`);
      paramIndex++;
    }

    if (locality) {
      queryText += ` AND locality ILIKE $${paramIndex}`;
      queryParams.push(`%${locality}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY event_date DESC`;

    // Add pagination
    if (limitNum !== null) {
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limitNum, offsetNum);
    } else if (offsetNum > 0) {
      queryText += ` OFFSET $${paramIndex}`;
      queryParams.push(offsetNum);
    }

    // Build count query with same filters
    let countQuery = `
      SELECT COUNT(*) as total
      FROM biological_data 
      WHERE event_date >= $1 AND event_date <= $2
    `;

    const countParams: (string | number)[] = [startDate.toISOString(), endDate.toISOString()];
    let countParamIndex = 3;

    if (bioGroup) {
      countQuery += ` AND bio_group = $${countParamIndex}`;
      countParams.push(bioGroup);
      countParamIndex++;
    }

    if (commonNameC) {
      countQuery += ` AND common_name_c ILIKE $${countParamIndex}`;
      countParams.push(`%${commonNameC}%`);
      countParamIndex++;
    }

    if (county) {
      countQuery += ` AND county ILIKE $${countParamIndex}`;
      countParams.push(`%${county}%`);
      countParamIndex++;
    }

    if (municipality) {
      countQuery += ` AND municipality ILIKE $${countParamIndex}`;
      countParams.push(`%${municipality}%`);
      countParamIndex++;
    }

    if (locality) {
      countQuery += ` AND locality ILIKE $${countParamIndex}`;
      countParams.push(`%${locality}%`);
      countParamIndex++;
    }

    // Execute queries
    const [dataResult, countResult] = await Promise.all([
      query(queryText, queryParams),
      query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const hasMore = limitNum !== null ? offsetNum + limitNum < total : false;

    return NextResponse.json({
      data: dataResult.rows,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        has_more: hasMore
      },
      filters: {
        time_range: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        bio_group: bioGroup,
        common_name_c: commonNameC,
        county: county,
        municipality: municipality,
        locality: locality
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