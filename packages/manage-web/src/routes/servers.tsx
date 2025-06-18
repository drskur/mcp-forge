import { Component, createSignal } from "solid-js";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ServerFormDialog } from "@/components/dialog/ServerFormDialog";
import { createAsync, query, useAction } from "@solidjs/router";
import { createServer } from "@/actions/server";
import { queryItemsByCreatedAt } from "@/db/dynamodb";
import { ENTITY_TYPES } from "@/db/helper";
import { McpServerDdbItem } from "@/types/server";

const getServers = query(async () => {
  "use server";
  return await queryItemsByCreatedAt<McpServerDdbItem>(ENTITY_TYPES.SERVER);
}, "servers");

const Servers: Component = () => {
  const [open, setOpen] = createSignal(false);

  const servers = createAsync(() => getServers());
  const createServerAction = useAction(createServer);

  return (
    <MainLayout>
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Servers</h1>
          <Button onClick={() => setOpen(true)}>Add Server</Button>
        </div>

        <ServerFormDialog
          open={open()}
          setOpen={setOpen}
          onSubmit={async data => await createServerAction(data)}
        />

        <div class="grid gap-4">
          {servers()?.length === 0 ? (
            <div class="p-6 rounded-lg bg-card border border-border">
              <h3 class="text-lg font-semibold mb-2">Server List</h3>
              <p class="text-muted-foreground">No servers configured yet.</p>
            </div>
          ) : (
            servers()?.map((server) => (
              <div class="p-6 rounded-lg bg-card border border-border">
                <div class="flex items-start justify-between">
                  <div class="space-y-1">
                    <h3 class="text-lg font-semibold">{server.name}</h3>
                    <p class="text-sm text-muted-foreground">{server.description}</p>
                  </div>
                  <span class="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {server.alias}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Servers;
