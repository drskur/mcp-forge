import { Component } from "solid-js";
import { McpServerDdbItem } from "@/types/server";
import { formatDate } from "@/lib/date";

interface ServerDetailCardProps {
  server: McpServerDdbItem;
}

export const ServerDetailCard: Component<ServerDetailCardProps> = (props) => {
  return (
    <div class="rounded-lg border bg-card">
      <div class="p-6 space-y-6">
        {/* Server Info */}
        <div class="space-y-4">
          <dl class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-muted-foreground">
                  ID
                </dt>
                <dd class="mt-1">
                  <code class="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {props.server.id}
                  </code>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-muted-foreground">
                  Created At
                </dt>
                <dd class="mt-1 text-sm">
                  {formatDate(props.server.createdAt)}
                </dd>
              </div>
            </div>
            <div>
              <dt class="text-sm font-medium text-muted-foreground">
                Name
              </dt>
              <dd class="mt-1 text-sm">{props.server.name}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-muted-foreground">
                Description
              </dt>
              <dd class="mt-1 text-sm">
                {props.server.description || "-"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};