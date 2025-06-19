import { Component, For, Show } from "solid-js";
import { McpToolDdbItem } from "@/types/tool";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-solid";

interface ToolTableProps {
  tools: McpToolDdbItem[];
  onEdit: (tool: McpToolDdbItem) => void;
  onDelete: (tool: McpToolDdbItem) => void;
}

export const ToolTable: Component<ToolTableProps> = (props) => {
  return (
    <div class="rounded-lg border bg-card">
      <Show
        when={props.tools.length > 0}
        fallback={
          <div class="p-6 text-center text-muted-foreground">
            No tools configured yet.
          </div>
        }
      >
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Name
                </th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Description
                </th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Integration Type
                </th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Integration ARN
                </th>
                <th class="h-12 px-4 text-left align-middle w-12"></th>
              </tr>
            </thead>
            <tbody>
              <For each={props.tools}>
                {tool => (
                  <tr class="border-b hover:bg-muted/50 transition-colors">
                    <td class="px-4 py-3 font-medium">
                      {tool.name}
                    </td>
                    <td class="px-4 py-3 text-sm text-muted-foreground">
                      {tool.description || "-"}
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {tool.integrationType}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <code class="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
                        {tool.integrationArn}
                      </code>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => props.onEdit(tool)}
                        >
                          <Edit class="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => props.onDelete(tool)}
                          class="text-destructive hover:text-destructive"
                        >
                          <Trash2 class="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </div>
  );
};