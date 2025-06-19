import { Component, For, createSignal, Show, Setter } from "solid-js";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-solid";
import { ToolParameter } from "@/types/tool";
import { SingleParameterSheet } from "./SingleParameterSheet";

interface ParameterEditorProps {
  parameters: ToolParameter[];
  setParameters: Setter<ToolParameter[]>;
}

export const ParameterEditor: Component<ParameterEditorProps> = props => {
  const [sheetOpen, setSheetOpen] = createSignal(false);
  const [editingParameter, setEditingParameter] =
    createSignal<ToolParameter | null>(null);
  const [editingIndex, setEditingIndex] = createSignal<number | null>(null);

  const handleAddParameter = () => {
    setEditingParameter(null);
    setEditingIndex(null);
    setSheetOpen(true);
  };

  const handleEditParameter = (param: ToolParameter, index: number) => {
    setEditingParameter(param);
    setEditingIndex(index);
    setSheetOpen(true);
  };

  const handleRemoveParameter = (index: number) => {
    const newParameters = props.parameters.filter((_, i) => i !== index);
    props.setParameters(newParameters);
  };

  const handleSaveParameter = (parameter: ToolParameter) => {
    const index = editingIndex();
    if (index !== null) {
      // 편집
      const newParameters = [...props.parameters];
      newParameters[index] = parameter;
      props.setParameters(newParameters);
    } else {
      // 새 파라미터 추가
      props.setParameters([...props.parameters, parameter]);
    }
  };

  const getTypeDisplay = (param: ToolParameter) => {
    if (param.type === "enum" && param.enumValues) {
      return `enum(${param.enumValues.length})`;
    }
    if (param.type === "array" && param.arrayItemType) {
      return `${param.arrayItemType}[]`;
    }
    return param.type;
  };

  return (
    <div class="rounded-lg border bg-card">
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold mb-2">Parameters</h2>
            <p class="text-muted-foreground">
              Define the parameters that this tool accepts.
            </p>
          </div>
          <Button onClick={handleAddParameter} size="sm">
            <Plus class="h-4 w-4 mr-2" />
            Add Parameter
          </Button>
        </div>

        <Show
          when={props.parameters.length > 0}
          fallback={
            <div class="text-center py-8 text-muted-foreground">
              No parameters defined yet. Click "Add Parameter" to get started.
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
                    Type
                  </th>
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Required
                  </th>
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Description
                  </th>
                  <th class="h-12 px-4 text-right align-middle font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                <For each={props.parameters}>
                  {(param, index) => (
                    <tr class="border-b hover:bg-muted/50 transition-colors">
                      <td class="px-4 py-3">
                        <div class="font-medium">
                          {param.name || `Parameter ${index() + 1}`}
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <span class="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          {getTypeDisplay(param)}
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        {param.required ? (
                          <span class="inline-flex items-center px-2 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
                            required
                          </span>
                        ) : (
                          <span class="text-muted-foreground text-sm">
                            optional
                          </span>
                        )}
                      </td>
                      <td class="px-4 py-3">
                        <div class="text-sm text-muted-foreground max-w-xs truncate">
                          {param.description || "-"}
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditParameter(param, index())}
                          >
                            <Edit class="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveParameter(index())}
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

        {/* Single Parameter Sheet */}
        <SingleParameterSheet
          open={sheetOpen()}
          setOpen={setSheetOpen}
          parameter={editingParameter()}
          onSave={handleSaveParameter}
          isEdit={editingIndex() !== null}
        />
      </div>
    </div>
  );
};
