import { Component, For, Show } from "solid-js";
import { LambdaFunction } from "@/types/lambda";

interface LambdaTableProps {
  functions: LambdaFunction[];
  isLoading: boolean;
  onSelectFunction?: (func: LambdaFunction) => void;
  selectedFunction?: LambdaFunction | null;
}

export const LambdaTable: Component<LambdaTableProps> = (props) => {
  return (
    <div class="rounded-lg border bg-card">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Lambda Functions</h3>
        
        <Show
          when={!props.isLoading}
          fallback={
            <div class="flex items-center justify-center py-8">
              <div class="text-muted-foreground">Loading Lambda functions...</div>
            </div>
          }
        >
          <Show
            when={props.functions.length > 0}
            fallback={
              <div class="text-center py-8 text-muted-foreground">
                No Lambda functions found
              </div>
            }
          >
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left p-3 font-medium text-muted-foreground">Name</th>
                    <th class="text-left p-3 font-medium text-muted-foreground">Runtime</th>
                    <th class="text-left p-3 font-medium text-muted-foreground">Handler</th>
                    <th class="text-left p-3 font-medium text-muted-foreground">Size</th>
                    <th class="text-left p-3 font-medium text-muted-foreground">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={props.functions}>
                    {(func) => (
                      <tr 
                        class={`border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                          props.selectedFunction?.functionName === func.functionName 
                            ? "bg-primary/5 border-primary/20" 
                            : ""
                        }`}
                        onClick={() => props.onSelectFunction?.(func)}
                      >
                        <td class="p-3">
                          <div class="space-y-1">
                            <div class="font-medium">{func.functionName}</div>
                            <Show when={func.description}>
                              <div class="text-sm text-muted-foreground">
                                {func.description}
                              </div>
                            </Show>
                          </div>
                        </td>
                        <td class="p-3">
                          <span class="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium">
                            {func.runtime}
                          </span>
                        </td>
                        <td class="p-3">
                          <code class="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground">
                            {func.functionArn}
                          </code>
                        </td>
                        <td class="p-3 text-sm text-muted-foreground">
                          -
                        </td>
                        <td class="p-3 text-sm text-muted-foreground">
                          -
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
};