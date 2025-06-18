import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props: any) => (
        <Suspense
          fallback={
            <div class="min-h-screen flex items-center justify-center bg-background">
              <div class="flex flex-col items-center gap-4">
                <div class="relative">
                  <div class="h-12 w-12 rounded-full border-4 border-muted animate-pulse" />
                  <div class="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
                <p class="text-sm text-muted-foreground animate-pulse">Loading...</p>
              </div>
            </div>
          }
        >
          {props.children}
        </Suspense>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
