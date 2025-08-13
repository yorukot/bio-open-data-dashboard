import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CountyBrightnessRow, AreaLightData } from '@/lib/types/database';

// Taiwan region mapping
const COUNTY_TO_REGION: Record<string, string> = {
  // 北區 (Northern Region)
  '台北市': '北區', '臺北市': '北區',
  '新北市': '北區',
  '基隆市': '北區',
  '桃園市': '北區',
  '新竹市': '北區',
  '新竹縣': '北區',

  // 中區 (Central Region)
  '苗栗縣': '中區',
  '台中市': '中區', '臺中市': '中區',
  '彰化縣': '中區',
  '南投縣': '中區',
  '雲林縣': '中區',

  // 南區 (Southern Region)
  '嘉義市': '南區',
  '嘉義縣': '南區',
  '台南市': '南區', '臺南市': '南區',
  '高雄市': '南區',
  '屏東縣': '南區',

  // 東區 (Eastern Region)
  '宜蘭縣': '東區',
  '花蓮縣': '東區',
  '台東縣': '東區', '臺東縣': '東區',
  '澎湖縣': '東區',
  '金門縣': '東區',
  '連江縣': '東區'
};

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
        { error: 'Invalid month format. Must be a number between 1 and 12' },
        { status: 400 }
      );
    }

    const year = searchParams.get('year');
    let yearNum: number | undefined;
    
    if (year) {
      yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        return NextResponse.json(
          { error: 'Invalid year format. Must be a valid year between 1900 and 2100' },
          { status: 400 }
        );
      }
    }

    // Build query with optional year filter
    let queryText = `
      SELECT 
        county,
        AVG(brightness) as avg_brightness
      FROM light_data_with_county 
      WHERE 
        EXTRACT(MONTH FROM time) = $1
        AND county IS NOT NULL
        AND brightness IS NOT NULL
    `;

    const queryParams: (number | string)[] = [monthNum];

    if (yearNum) {
      queryText += ` AND EXTRACT(YEAR FROM time) = $2`;
      queryParams.push(yearNum);
    }

    queryText += `
      GROUP BY county
      ORDER BY county
    `;

    const result = await query(queryText, queryParams);

    // Aggregate by regions
    const regionAggregation = new Map<string, { total: number; count: number }>();
    
    result.rows.forEach((row: CountyBrightnessRow) => {
      const county = row.county;
      const avgBrightness = parseFloat(row.avg_brightness);
      const region = COUNTY_TO_REGION[county] || '其他'; // Default to "其他" for unknown counties

      if (!regionAggregation.has(region)) {
        regionAggregation.set(region, { total: 0, count: 0 });
      }

      const regionData = regionAggregation.get(region)!;
      regionData.total += avgBrightness;
      regionData.count += 1;
    });

    // Calculate averages and format response
    const data: AreaLightData[] = [];
    regionAggregation.forEach((regionData, area) => {
      const average = regionData.total / regionData.count;
      data.push({
        area,
        light_pollution_average: Math.round(average * 100) / 100 // Round to 2 decimal places
      });
    });

    // Sort by region name for consistent output
    data.sort((a, b) => a.area.localeCompare(b.area));

    return NextResponse.json({
      data,
      month: monthNum,
      year: yearNum,
      total_regions: data.length
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}