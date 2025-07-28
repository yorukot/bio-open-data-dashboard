import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <SidebarTrigger />
            <div className="ml-4">
              <h1 className="text-xl font-semibold">Bio Open Data Dashboard</h1>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Welcome to Bio Open Data Dashboard
              </h2>
              <p className="text-muted-foreground">
                Explore and analyze biological datasets with powerful
                visualization and export tools.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-2">Data Sources</h3>
                <p className="text-sm text-muted-foreground">
                  Connect to various biological databases and data repositories.
                </p>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-2">Visualizations</h3>
                <p className="text-sm text-muted-foreground">
                  Create interactive charts and graphs from your biological
                  data.
                </p>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-2">Analysis Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Perform statistical analysis and data processing operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
