import { Component, createSignal } from "solid-js";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { AddServerDialog } from "@/components/dialog/AddServerDialog";

const Servers: Component = () => {
  const [open, setOpen] = createSignal(false);

  return (
    <MainLayout>
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Servers</h1>
          <Button onClick={() => setOpen(true)}>Add Server</Button>
        </div>

        <AddServerDialog open={open()} setOpen={setOpen} />

        <div class="grid gap-4">
          {/* Server list will go here */}
          <div class="p-6 rounded-lg bg-card border border-border">
            <h3 class="text-lg font-semibold mb-2">Server List</h3>
            <p class="text-muted-foreground">No servers configured yet.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Servers;
