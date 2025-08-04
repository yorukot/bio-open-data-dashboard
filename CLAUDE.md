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

## Data Conventions
- Use realistic biological/scientific data for examples
- Include scientific names in parentheses for species
- Show appropriate metrics with proper units
- Include change indicators where relevant (+/- values)