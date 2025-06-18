import { Component } from "solid-js";
import { MainLayout } from "@/components/layout";

const Home: Component = () => {
  return (
    <MainLayout>
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold">Welcome to MCP Forge</h1>
          <p class="text-lg text-muted-foreground mt-2">
            Build and manage your Model Context Protocol tools
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            class="p-6 rounded-lg"
            style={{
              "background-color": "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <h3 class="text-lg font-semibold mb-2">🖥️ Servers</h3>
            <p class="text-sm text-muted-foreground">
              Manage your MCP servers and their configurations
            </p>
          </div>

          <div
            class="p-6 rounded-lg"
            style={{
              "background-color": "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <h3 class="text-lg font-semibold mb-2">🔧 Tools</h3>
            <p class="text-sm text-muted-foreground">
              Browse and configure available tools
            </p>
          </div>

          <div
            class="p-6 rounded-lg"
            style={{
              "background-color": "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <h3 class="text-lg font-semibold mb-2">📊 Analytics</h3>
            <p class="text-sm text-muted-foreground">
              Monitor usage and performance metrics
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
