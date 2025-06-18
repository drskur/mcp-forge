import { Component, createSignal, For, Show } from "solid-js";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ServerFormDialog } from "@/components/dialog/ServerFormDialog";
import { ServerFormSheet } from "@/components/sheet/ServerFormSheet";
import { createAsync, query, useAction } from "@solidjs/router";
import { createServer } from "@/actions/server";
import { queryItemsByCreatedAt } from "@/db/dynamodb";
import { ENTITY_TYPES } from "@/db/helper";
import { McpServerDdbItem } from "@/types/server";
import { Search, MoreVertical } from "lucide-solid";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
} from "@/components/ui/radio-group";

const getServers = query(async () => {
  "use server";
  return await queryItemsByCreatedAt<McpServerDdbItem>(ENTITY_TYPES.SERVER);
}, "servers");

const Servers: Component = () => {
  const [open, setOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedServer, setSelectedServer] = createSignal<string | null>(null);

  const servers = createAsync(() => getServers());
  const createServerAction = useAction(createServer);

  const filteredServers = () => {
    const query = searchQuery().toLowerCase();
    return (
      servers()?.filter(
        server =>
          server.name.toLowerCase().includes(query) ||
          server.description?.toLowerCase().includes(query) ||
          server.alias.toLowerCase().includes(query)
      ) || []
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <MainLayout>
      <div class="space-y-6">
        {/* Header */}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold">Servers</h1>
            <span class="text-muted-foreground">
              ({filteredServers().length}/{servers()?.length || 0})
            </span>
          </div>
          <div class="flex items-center gap-2">
            <Button onClick={() => setOpen(true)}>Create Server</Button>
          </div>
        </div>

        {/* Search Bar */}
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Find Servers"
            value={searchQuery()}
            onInput={e => setSearchQuery(e.currentTarget.value)}
            class="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Table */}
        <RadioGroup
          value={selectedServer() || ""}
          onChange={value => setSelectedServer(value || null)}
        >
          <div class="rounded-lg border bg-card">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b bg-muted/50">
                    <th class="h-12 px-4 text-left align-middle"></th>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      <button class="flex items-center gap-1 hover:text-foreground">
                        Name
                      </button>
                    </th>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      <button class="flex items-center gap-1 hover:text-foreground">
                        Description
                      </button>
                    </th>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      <button class="flex items-center gap-1 hover:text-foreground">
                        ID
                      </button>
                    </th>

                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      <button class="flex items-center gap-1 hover:text-foreground">
                        Created
                      </button>
                    </th>
                    <th class="h-12 px-4 text-left align-middle w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  <Show
                    when={filteredServers().length > 0}
                    fallback={
                      <tr>
                        <td
                          colspan="7"
                          class="h-24 text-center text-muted-foreground"
                        >
                          No servers configured yet.
                        </td>
                      </tr>
                    }
                  >
                    <For each={filteredServers()}>
                      {server => (
                        <tr class="border-b hover:bg-muted/50 transition-colors">
                          <td class="px-4 py-3">
                            <RadioGroupItem value={server.id} class="flex">
                              <RadioGroupItemControl />
                            </RadioGroupItem>
                          </td>
                          <td class="px-4 py-3">
                            <a
                              href="#"
                              class="text-primary hover:underline font-medium"
                            >
                              {server.name}
                            </a>
                          </td>
                          <td class="px-4 py-3 text-sm text-muted-foreground">
                            {server.description || "-"}
                          </td>
                          <td class="px-4 py-3">
                            <code class="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {server.alias}
                            </code>
                          </td>
                          <td class="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(server.createdAt)}
                          </td>
                          <td class="px-4 py-3">
                            <button
                              class="p-1 hover:bg-muted rounded-md transition-colors"
                              onClick={() => alert("Menu not implemented")}
                            >
                              <MoreVertical class="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )}
                    </For>
                  </Show>
                </tbody>
              </table>
            </div>
          </div>
        </RadioGroup>

        {/* Dialog 버전 */}
        {/* <ServerFormDialog
          open={open()}
          setOpen={setOpen}
          onSubmit={async data => await createServerAction(data)}
        /> */}
        
        {/* Sheet 버전 */}
        <ServerFormSheet
          open={open()}
          setOpen={setOpen}
          onSubmit={async data => await createServerAction(data)}
        />
      </div>
    </MainLayout>
  );
};

export default Servers;
