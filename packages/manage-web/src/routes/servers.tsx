import {
  Component,
  createSignal,
  For,
  Show,
  createEffect,
  createMemo,
} from "solid-js";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ServerFormSheet } from "@/components/sheet/ServerFormSheet";
import { createAsync, query, useAction } from "@solidjs/router";
import { createServer, deleteServer, updateServer } from "@/actions/server";
import { queryItemsByCreatedAt } from "@/db/dynamodb";
import { ENTITY_TYPES } from "@/db/helper";
import { McpServerDdbItem } from "@/types/server";
import { Search } from "lucide-solid";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
} from "@/components/ui/radio-group";
import { ServerActionsMenu } from "@/components/server/ServerActionsMenu";
import { ConfirmDialog } from "@/components/dialog/ConfirmDialog";

const getServers = query(async () => {
  "use server";
  return await queryItemsByCreatedAt<McpServerDdbItem>(ENTITY_TYPES.SERVER);
}, "servers");

const Servers: Component = () => {
  const [sheetOpen, setSheetOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedServer, setSelectedServer] = createSignal<string | undefined>(
    undefined
  );
  const [isRadioGroupReady, setIsRadioGroupReady] = createSignal(false);
  const [editingServer, setEditingServer] = createSignal<
    McpServerDdbItem | undefined
  >(undefined);
  const [confirmDialogOpen, setConfirmDialogOpen] = createSignal(false);
  const [deletingServer, setDeletingServer] = createSignal<
    McpServerDdbItem | undefined
  >(undefined);

  const servers = createAsync(() => getServers());
  const createServerAction = useAction(createServer);
  const updateServerAction = useAction(updateServer);
  const deleteServerAction = useAction(deleteServer);

  // RadioGroup 초기화를 위한 effect
  createEffect(() => {
    if (servers()) {
      setIsRadioGroupReady(true);
    }
  });

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

  const handleEdit = (server: McpServerDdbItem) => {
    setEditingServer(server);
    setSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setEditingServer(undefined);
  };

  const handleDelete = (server: McpServerDdbItem) => {
    setDeletingServer(server);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    const server = deletingServer();
    if (server) {
      await deleteServerAction(server);
      setDeletingServer(undefined);
    }
  };

  // initialData를 createMemo로 계산하여 reactive computation 경고 해결
  const initialData = createMemo(() =>
    editingServer()
      ? {
          name: editingServer()?.name ?? "",
          description: editingServer()?.description ?? "",
        }
      : undefined
  );

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
            <Button
              onClick={() => {
                setEditingServer(undefined);
                setSheetOpen(true);
              }}
            >
              Create Server
            </Button>
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
        <Show
          when={servers() && isRadioGroupReady()}
          fallback={
            <div class="rounded-lg border bg-card">
              <div class="p-6 text-center text-muted-foreground">
                <div class="animate-pulse">Loading servers...</div>
              </div>
            </div>
          }
        >
          <RadioGroup value={selectedServer()} onChange={setSelectedServer}>
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
                              <ServerActionsMenu
                                server={server}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                              />
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
        </Show>

        {/* Sheet 버전 */}
        <ServerFormSheet
          open={sheetOpen()}
          setOpen={handleSheetClose}
          onCreate={async data => await createServerAction(data)}
          onEdit={async data => {
            const item = editingServer();
            if (item) {
              await updateServerAction(item, data);
              setEditingServer(undefined);
            }
          }}
          initialData={initialData()}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialogOpen()}
          setOpen={setConfirmDialogOpen}
          title="Delete Server"
          description={`Are you sure you want to delete "${deletingServer()?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          variant="destructive"
        />
      </div>
    </MainLayout>
  );
};

export default Servers;
