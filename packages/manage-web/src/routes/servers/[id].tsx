import { Component, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { createAsync, query } from "@solidjs/router";
import { MainLayout } from "@/components/layout";
import { getItemByKey } from "@/db/dynamodb";
import { createServerPK, createServerSK } from "@/db/helper";
import { McpServerDdbItem } from "@/types/server";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-solid";
import { ServerDetailCard } from "@/components/server/ServerDetailCard";

const getServer = query(async (id: string) => {
  "use server";
  const key = {
    PK: createServerPK(id),
    SK: createServerSK(),
  };
  return await getItemByKey<McpServerDdbItem>(key);
}, "server");

const ServerDetail: Component = () => {
  const params = useParams();
  const server = createAsync(() => getServer(params.id));

  return (
    <MainLayout>
      <div class="space-y-6">
        {/* Header */}
        <div class="flex items-center gap-4">
          <Button as="a" href="/servers" variant="ghost" size="icon">
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <h1 class="text-2xl font-bold">Server Details</h1>
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
      </div>
    </MainLayout>
  );
};

export default ServerDetail;
