# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Bio Open Data Dashboard - Development Guidelines

## Development Commands

### Core Development

```bash
# Start development server (uses Turbopack)
pnpm dev

# Build for production
pnpm build
pnpm start

# Code quality
pnpm lint
```

### Database Setup

```bash
# Start TimescaleDB with Docker
docker-compose up -d

# Data insertion (Go scripts)
cd insert_data
go run main.go migrate.go data_schema.go
```

## Architecture Overview

### Tech Stack

- **Next.js 15.4.4** with App Router and React 19
- **TypeScript** with strict mode
- **TanStack Query v5** for API state management
- **Mapbox GL** with react-map-gl for interactive mapping
- **Tailwind CSS 4** with shadcn/ui components
- **PostgreSQL + TimescaleDB** for time-series data

### Project Structure

```
/src
├── app/                    # Next.js App Router pages
│   ├── api/               # API route handlers
│   ├── map/               # Interactive map page
│   ├── statistics/        # Analytics dashboard
│   └── leaderboard/       # Data ranking page
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
└── lib/                   # Utilities and configurations
    ├── api-client.ts      # Centralized API client
    ├── hooks/             # API-specific hooks
    └── types/             # TypeScript definitions
```

### Data Sources

1. **Light Pollution Data**: TimescaleDB time-series
2. **TBIA Biodiversity Data**: Species data with location/temporal info

### Time Range Configuration

All time-based functionality uses a global configuration system:

```typescript
import {
  getAvailableYears,
  getAvailableMonths,
  getDefaultDate,
  isValidDate,
  clampDate,
} from "@/lib/config/time-range";

// Get allowed years (2012-2025)
const years = getAvailableYears();

// Get allowed months
const months = getAvailableMonths();

// Get default date for new sessions
const defaultDate = getDefaultDate();

// Validate and clamp dates to allowed range
const validDate = isValidDate(someDate) ? someDate : clampDate(someDate);
```

**Important**: All components that handle time/date selection MUST use this global configuration to ensure consistency across the application. The allowed time range can be modified in `/src/lib/config/time-range.ts`.

### Progressive Data Loading

Large datasets use progressive loading with render milestones:

```typescript
const { data, progress } = useProgressiveLightData({
  params: { start_time, end_time },
  batchSize: 100000, // Default batch size
});
```

## Page Structure & Styling Conventions

### Page Layout

All pages should follow this consistent structure:

```tsx
<main className="flex-1 flex flex-col overflow-hidden">
  <div className="flex-1 p-6 overflow-auto">
    <div className="max-w-[size]xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight mb-2">[Page Title]</h2>
        <p className="text-muted-foreground">[Page description]</p>
      </div>

      {/* Page content */}
    </div>
  </div>
</main>
```

### Title Sizing Standards

- **Main page title** (first h2 in content): `text-3xl font-bold tracking-tight mb-2`
- **Section titles** (subsections): `text-2xl font-semibold tracking-tight mb-2`
- **Card/Component titles**: `text-lg font-semibold`

### Container Sizing

- **Statistics page**: `max-w-7xl mx-auto`
- **Leaderboard page**: `max-w-6xl mx-auto`
- **Other pages**: Choose appropriate size based on content width needs

### Component Organization

- Keep all UI logic within page files (following statistics page pattern)
- Extract reusable components only when they're used across multiple pages
- Use internal components within pages for complex UI elements (like LeaderboardCard)

### Spacing

- **Header section** (title + description): `mb-6` for standard spacing after header
- **Main title section**: `mb-8` for larger spacing between major sections
- **Regular sections**: `mb-6` for standard spacing
- **Title to description**: `mb-2` for tight coupling

### Examples

**Page Header Structure:**

```tsx
<div className="mb-6">
  <h2 className="text-3xl font-bold tracking-tight mb-2">數據統計</h2>
  <p className="text-muted-foreground">生物數據的綜合統計分析和可視化。</p>
</div>
```

**Section Structure:**

```tsx
<section>
  <div className="mb-6">
    <h3 className="text-2xl font-semibold tracking-tight mb-2">關鍵指標</h3>
    <p className="text-muted-foreground">基本數據統計和性能指標概覽</p>
  </div>
  {/* Section content */}
</section>
```

**Section Titles (without description):**

```tsx
<h3 className="text-2xl font-semibold tracking-tight mb-2">Key Metrics</h3>
```

## API Usage Guidelines

### MANDATORY: Always Use API Wrapper

**NEVER write raw fetch() calls to our API endpoints. Always use the provided API wrapper.**

### Import and Usage

```tsx
// For React Query hooks (RECOMMENDED)
import { useLightData, useTBIAData } from "@/lib/hooks/use-api";

// For direct API client (when used as React Query fetchers)
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
```

### React Query Hooks Usage (Recommended)

```tsx
// Light pollution data
const {
  data: lightData,
  isLoading,
  error,
} = useLightData({
  start_time: "2024-01-01T00:00:00Z",
  end_time: "2024-12-31T23:59:59Z",
  limit: 100,
  offset: 0,
});

// TBIA biodiversity data with filters
const { data: tbiaData, isLoading } = useTBIAData({
  bio_group: "鳥類",
  county: "臺北市",
  municipality: "大安區",
  limit: 50,
});

// TBIA data with time range
const { data: tbiaData } = useTBIAData({
  start_time: "2023-01-01T00:00:00Z",
  end_time: "2023-12-31T23:59:59Z",
  common_name_c: "臺灣",
});
```

### Direct API Client Usage (for custom React Query)

```tsx
// Custom query with specific options
const { data, isLoading } = useQuery({
  queryKey: ["light-data", params],
  queryFn: () => apiClient.getLightData(params),
  refetchInterval: 30000, // Custom refetch interval
  enabled: !!params.start_time,
});
```

### Error Handling

All API methods throw `APIError` with proper status codes and messages:

```tsx
const { data, error } = useLightData(params);

if (error) {
  // error is typed as APIError
  console.log(`API Error ${error.status}: ${error.message}`);
}
```

### Available Bio Groups

Use the exported constant for bio group filtering:

```tsx
import { BIO_GROUPS } from "@/lib/types/api";
// ['鳥類', '兩棲類', '哺乳類', '爬蟲類', '魚類', '昆蟲', '蜘蛛']
```

## Chart Implementation Guidelines

### Chart Color Configuration

When implementing charts with shadcn/ui chart components, use CSS variables from globals.css:

```tsx
// CORRECT: Use CSS variable directly
const chartConfig = {
  data_key: {
    label: "Label",
    color: "var(--chart-1)", // --chart-1 already contains full HSL value
  },
}

// INCORRECT: Don't wrap in hsl() again
color: "hsl(var(--chart-1))" // This breaks the color

// Chart component usage
<Bar
  dataKey="data_key"
  fill="var(--color-data_key)" // Auto-generated by shadcn chart system
  radius={4}
/>
```

### Available Chart Colors

- `--chart-1`: `hsl(153, 100%, 38%)` (primary green)
- `--chart-2`: `hsl(220, 14%, 96%)` (light gray)
- `--chart-3`: `hsl(220, 14%, 96%)` (light gray)
- `--chart-4`: `hsl(220, 14%, 99%)` (very light gray)
- `--chart-5`: `hsl(36 100% 50%)` (orange)

### Chart Data Structure Patterns

For county/city distribution charts:

```tsx
// Transform API data to chart format
const chartData = data
  .map((county) => {
    const average =
      county.data.reduce((sum, item) => sum + item.value, 0) /
      county.data.length;
    return {
      county: county.county,
      value: Math.round(average * 100) / 100,
    };
  })
  .sort((a, b) => b.value - a.value); // Sort descending
```

### Chart Troubleshooting

- If bars appear black: Check color configuration syntax
- Ensure `color: "var(--chart-1)"` not `color: "hsl(var(--chart-1))"`
- Use `fill="var(--color-{dataKey})"` in chart components
- Direct hex colors work as fallback: `color: "#3b82f6"`

## Data Conventions

- Use realistic biological/scientific data for examples
- Include scientific names in parentheses for species
- Show appropriate metrics with proper units
- Include change indicators where relevant (+/- values)
