export function Sidebar() {
  return (
    <aside class="app-sidebar w-64 border-r">
      <nav class="p-4 space-y-2">
        <a
          href="/servers"
          class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Servers
        </a>
      </nav>
    </aside>
  );
}