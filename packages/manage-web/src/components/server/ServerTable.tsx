import { Component, For, Show } from "solid-js";
import { RadioGroup, RadioGroupItem, RadioGroupItemControl } from "@/components/ui/radio-group";
import { McpServerDdbItem } from "@/types/server";
import { formatDate } from "@/lib/date";
import { ServerActionsMenu } from "./ServerActionsMenu";

interface ServerTableProps {
  servers: McpServerDdbItem[];
  selectedServer: string | undefined;
  onServerSelect: (serverId: string) => void;
  onEdit: (server: McpServerDdbItem) => void;
  onDelete: (server: McpServerDdbItem) => void;
}

export const ServerTable: Component<ServerTableProps> = (props) => {
  return (
    <RadioGroup value={props.selectedServer} onChange={props.onServerSelect}>
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
                when={props.servers.length > 0}
                fallback={
                  <tr>
                    <td
                      colspan="6"
                      class="h-24 text-center text-muted-foreground"
                    >
                      No servers configured yet.
                    </td>
                  </tr>
                }
              >
                <For each={props.servers}>
                  {server => (
                    <tr class="border-b hover:bg-muted/50 transition-colors">
                      <td class="px-4 py-3">
                        <RadioGroupItem value={server.id} class="flex">
                          <RadioGroupItemControl />
                        </RadioGroupItem>
                      </td>
                      <td class="px-4 py-3">
                        <a
                          href={`/servers/${server.id}`}
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
                          {server.id}
                        </code>
                      </td>
                      <td class="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(server.createdAt)}
                      </td>
                      <td class="px-4 py-3">
                        <ServerActionsMenu
                          server={server}
                          onEdit={props.onEdit}
                          onDelete={props.onDelete}
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
  );
};