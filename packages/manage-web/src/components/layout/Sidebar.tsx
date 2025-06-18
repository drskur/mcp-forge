export function Sidebar() {
  return (
    <aside class="w-64 border-r bg-sidebar">
      <nav class="p-4 space-y-2">
        <a
          href="/servers"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          Servers
        </a>
      </nav>
    </aside>
  );
}