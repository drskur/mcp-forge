import { Zap } from "lucide-solid";

export function NavBar() {
  return (
    <header class="h-16 border-b flex items-center px-6 bg-background">
      <div class="flex items-center justify-between w-full">
        <h1 class="text-xl font-semibold flex items-center gap-2">
          <Zap size={20} class="text-yellow-500" />
          <span class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            MCP Forge
          </span>
        </h1>
        {/* Header content here */}
      </div>
    </header>
  );
}