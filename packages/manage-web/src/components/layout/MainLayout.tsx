import {Component, JSX} from "solid-js";

interface MainLayoutProps {
    children?: JSX.Element;
}

export const MainLayout: Component<MainLayoutProps> = (props) => {
    return (
        <div class="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <header class="app-header h-16 border-b flex items-center px-6">
                <div class="flex items-center justify-between w-full">
                    <h1 class="text-xl font-semibold">🔧 MCP Forge</h1>
                    {/* Header content here */}
                </div>
            </header>

            {/* Main Content Area */}
            <div class="flex flex-1 overflow-hidden">
                {/* Sidebar */}
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

                {/* Main Content */}
                <main class="app-main flex-1 overflow-auto p-6">
                    {props.children}
                </main>
            </div>
        </div>
    );
};