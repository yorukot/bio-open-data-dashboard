# Bio Open Data Dashboard - Development Guidelines

## Page Structure & Styling Conventions

### Page Layout
All pages should follow this consistent structure:
```tsx
<div className="flex h-screen">
  <SidebarProvider>
    <AppSidebar />
    <main className="flex-1 flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <SidebarTrigger />
          <div className="ml-4">
            <h1 className="text-xl font-semibold">[Page Name]</h1>
          </div>
        </div>
      </header>
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-[size]xl mx-auto">
          {/* Page content */}
        </div>
      </div>
    </main>
  </SidebarProvider>
</div>
```

### Title Sizing Standards
- **Header title** (in header bar): `text-xl font-semibold`
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
- **Main title section**: `mb-8` for larger spacing
- **Regular sections**: `mb-6` for standard spacing
- **Title to description**: `mb-2` for tight coupling

### Examples
**Statistics Page Title:**
```tsx
<h2 className="text-3xl font-bold tracking-tight mb-2">
  Data Statistics
</h2>
```

**Leaderboard Page Title:**
```tsx
<h2 className="text-3xl font-bold tracking-tight mb-2">
  Leaderboards
</h2>
```

**Section Titles:**
```tsx
<h3 className="text-2xl font-semibold tracking-tight mb-2">Key Metrics</h3>
```

## Data Conventions
- Use realistic biological/scientific data for examples
- Include scientific names in parentheses for species
- Show appropriate metrics with proper units
- Include change indicators where relevant (+/- values)