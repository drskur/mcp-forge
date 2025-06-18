import { Component } from "solid-js";
import { MainLayout } from "@/components/layout";

const Servers: Component = () => {
  return (
    <MainLayout>
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Servers</h1>
          <button
            class="px-4 py-2 text-sm font-medium rounded-lg"
            style={{
              "background-color": "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            Add Server
          </button>
        </div>

        <div class="grid gap-4">
          {/* Server list will go here */}
          <div
            class="p-6 rounded-lg"
            style={{
              "background-color": "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <h3 class="text-lg font-semibold mb-2">Server List</h3>
            <p class="text-muted-foreground">No servers configured yet.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Servers;
