import { Component, JSX } from "solid-js";
import { Sidebar } from "./Sidebar";
import { NavBar } from "./NavBar";

interface MainLayoutProps {
  children?: JSX.Element;
}

export const MainLayout: Component<MainLayoutProps> = (props) => {
  return (
    <div class="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <NavBar />

      {/* Main Content Area */}
      <div class="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main class="flex-1 overflow-auto p-6 bg-muted/40">
          {props.children}
        </main>
      </div>
    </div>
  );
};