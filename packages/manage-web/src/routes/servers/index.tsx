import {
  Component,
  createSignal,
  Show,
  createEffect,
  createMemo,
} from "solid-js";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ServerFormSheet } from "@/components/sheet/ServerFormSheet";
import { createAsync, query, useAction } from "@solidjs/router";
import { createServer, deleteServer, updateServer } from "@/actions/server";
import { queryItemsByCreatedAt } from "@/db/dynamodb";
import { ENTITY_TYPES } from "@/db/helper";
import { McpServerDdbItem } from "@/types/server";
import { ServerTable } from "@/components/server/ServerTable";
import { ConfirmDialog } from "@/components/dialog/ConfirmDialog";

const getServers = query(async () => {
  "use server";
  return await queryItemsByCreatedAt<McpServerDdbItem>(ENTITY_TYPES.SERVER);
}, "servers");

const Index: Component = () => {
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
          server.id.toLowerCase().includes(query)
      ) || []
    );
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
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Servers" }
          ]}
        />

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
        <SearchBar
          value={searchQuery()}
          onInput={setSearchQuery}
          placeholder="Find Index"
        />

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
          <ServerTable
            servers={filteredServers()}
            selectedServer={selectedServer()}
            onServerSelect={setSelectedServer}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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

export default Index;
