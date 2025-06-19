import { Component, Show, createSignal } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { createAsync, query, useAction } from "@solidjs/router";
import { MainLayout } from "@/components/layout";
import { getItemByKey, queryToolsByServerId } from "@/db/dynamodb";
import { createServerPK, createServerSK } from "@/db/helper";
import { McpServerDdbItem } from "@/types/server";
import { McpToolDdbItem } from "@/types/tool";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-solid";
import { ServerDetailCard } from "@/components/server/ServerDetailCard";
import { ToolTable } from "@/components/tool/ToolTable";
import { ServerFormSheet } from "@/components/sheet/ServerFormSheet";
import { ConfirmDialog } from "@/components/dialog/ConfirmDialog";
import { updateServer, deleteServer } from "@/actions/server";

const getServer = query(async (id: string) => {
  "use server";
  const key = {
    PK: createServerPK(id),
    SK: createServerSK(),
  };
  return await getItemByKey<McpServerDdbItem>(key);
}, "server");

const getServerTools = query(async (serverId: string) => {
  "use server";
  return await queryToolsByServerId(serverId);
}, "serverTools");

const ServerDetail: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const server = createAsync(() => getServer(params.id));
  const tools = createAsync(() => getServerTools(params.id));

  const [sheetOpen, setSheetOpen] = createSignal(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = createSignal(false);

  const updateServerAction = useAction(updateServer);
  const deleteServerAction = useAction(deleteServer);

  const handleDelete = async () => {
    const currentServer = server();
    if (currentServer) {
      await deleteServerAction(currentServer);
      navigate("/servers");
    }
  };

  const handleToolEdit = (tool: McpToolDdbItem) => {
    // TODO: Tool 수정 기능 구현
    console.log("Edit tool:", tool);
  };

  const handleToolDelete = (tool: McpToolDdbItem) => {
    // TODO: Tool 삭제 기능 구현
    console.log("Delete tool:", tool);
  };

  return (
    <MainLayout>
      <div class="space-y-6">
        {/* Header */}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button as="a" href="/servers" variant="ghost" size="icon">
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <h1 class="text-2xl font-bold">Server Details</h1>
          </div>
          <Show when={server()}>
            <div class="flex items-center gap-2">
              <Button
                onClick={() => setSheetOpen(true)}
                variant="outline"
                size="sm"
              >
                Edit
              </Button>
              <Button
                onClick={() => setConfirmDialogOpen(true)}
                variant="outline"
                size="sm"
                class="text-destructive hover:text-destructive"
              >
                Delete
              </Button>
            </div>
          </Show>
        </div>

        {/* Content */}
        <Show
          when={server()}
          fallback={
            <div class="rounded-lg border bg-card">
              <div class="p-6 text-center text-muted-foreground">
                <div class="animate-pulse">Loading server details...</div>
              </div>
            </div>
          }
        >
          <ServerDetailCard server={server()!} />
        </Show>

        {/* Tools Section */}
        <Show when={server()}>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">Tools</h2>
              <Button>Add Tool</Button>
            </div>

            <Show
              when={tools()}
              fallback={
                <div class="rounded-lg border bg-card">
                  <div class="p-6 text-center text-muted-foreground">
                    <div class="animate-pulse">Loading tools...</div>
                  </div>
                </div>
              }
            >
              <ToolTable
                tools={tools()!}
                onEdit={handleToolEdit}
                onDelete={handleToolDelete}
              />
            </Show>
          </div>
        </Show>

        {/* Edit Sheet */}
        <ServerFormSheet
          open={sheetOpen()}
          setOpen={setSheetOpen}
          onEdit={async data => {
            const currentServer = server();
            if (currentServer) {
              await updateServerAction(currentServer, data);
            }
          }}
          initialData={{
            name: server()?.name ?? "",
            description: server()?.description ?? "",
          }}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialogOpen()}
          setOpen={setConfirmDialogOpen}
          title="Delete Server"
          description={`Are you sure you want to delete "${server()?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
          variant="destructive"
        />
      </div>
    </MainLayout>
  );
};

export default ServerDetail;
