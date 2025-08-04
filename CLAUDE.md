# Bio Open Data Dashboard - Development Guidelines

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
        <p className="text-muted-foreground">
          [Page description]
        </p>
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
  <p className="text-muted-foreground">
    生物數據的綜合統計分析和可視化。
  </p>
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
import { useLightData, useTBIAData } from '@/lib/hooks/use-api';

// For direct API client (when used as React Query fetchers)
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
```

### React Query Hooks Usage (Recommended)
```tsx
// Light pollution data
const { data: lightData, isLoading, error } = useLightData({
  start_time: '2024-01-01T00:00:00Z',
  end_time: '2024-12-31T23:59:59Z',
  limit: 100,
  offset: 0
});

// TBIA biodiversity data with filters
const { data: tbiaData, isLoading } = useTBIAData({
  bio_group: '鳥類',
  county: '臺北市',
  municipality: '大安區',
  limit: 50
});

// TBIA data with time range
const { data: tbiaData } = useTBIAData({
  start_time: '2023-01-01T00:00:00Z',
  end_time: '2023-12-31T23:59:59Z',
  common_name_c: '臺灣'
});
```

### Direct API Client Usage (for custom React Query)
```tsx
// Custom query with specific options
const { data, isLoading } = useQuery({
  queryKey: ['light-data', params],
  queryFn: () => apiClient.getLightData(params),
  refetchInterval: 30000, // Custom refetch interval
  enabled: !!params.start_time
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
import { BIO_GROUPS } from '@/lib/types/api';
// ['鳥類', '兩棲類', '哺乳類', '爬蟲類', '魚類', '昆蟲', '蜘蛛']
```

## Data Conventions
- Use realistic biological/scientific data for examples
- Include scientific names in parentheses for species
- Show appropriate metrics with proper units
- Include change indicators where relevant (+/- values)