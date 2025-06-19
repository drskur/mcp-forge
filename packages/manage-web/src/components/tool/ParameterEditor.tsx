import { Component, For, createSignal, Show, Setter } from "solid-js";
import { Button } from "@/components/ui/button";
import {
  TextFieldRoot,
  TextFieldLabel,
  TextField,
} from "@/components/ui/textfield";
import { TextArea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-solid";
import { ToolParameter, ParameterType } from "@/types/tool";

interface ParameterEditorProps {
  parameters: ToolParameter[];
  setParameters: Setter<ToolParameter[]>;
}

const parameterTypes: { value: ParameterType; label: string }[] = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "bool", label: "Boolean" },
  { value: "enum", label: "Enum" },
  { value: "array", label: "Array" },
];

export const ParameterEditor: Component<ParameterEditorProps> = (props) => {
  const addParameter = () => {
    const newParameter: ToolParameter = {
      name: "",
      type: "string",
      description: "",
      required: false,
    };
    props.setParameters([...props.parameters, newParameter]);
  };

  const removeParameter = (index: number) => {
    const newParameters = props.parameters.filter((_, i) => i !== index);
    props.setParameters(newParameters);
  };

  const updateParameter = (index: number, field: keyof ToolParameter, value: any) => {
    const newParameters = [...props.parameters];
    newParameters[index] = { ...newParameters[index], [field]: value };
    props.setParameters(newParameters);
  };

  const updateEnumValues = (index: number, enumString: string) => {
    const enumValues = enumString.split(",").map(v => v.trim()).filter(v => v);
    updateParameter(index, "enumValues", enumValues);
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
          <Button onClick={addParameter} size="sm">
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
          <div class="space-y-4">
            <For each={props.parameters}>
              {(param, index) => (
                <div class="border rounded-lg p-4 space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-medium">Parameter #{index() + 1}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParameter(index())}
                      class="text-destructive hover:text-destructive"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextFieldRoot>
                      <TextFieldLabel>Name</TextFieldLabel>
                      <TextField
                        value={param.name}
                        onInput={(e) => updateParameter(index(), "name", e.currentTarget.value)}
                        placeholder="Parameter name"
                      />
                    </TextFieldRoot>

                    <div class="space-y-2">
                      <label class="text-sm font-medium">Type</label>
                      <Select
                        value={param.type}
                        onChange={(value) => updateParameter(index(), "type", value as ParameterType)}
                        options={parameterTypes.map(t => t.value)}
                        placeholder="Select type"
                        itemComponent={(itemProps) => {
                          const type = parameterTypes.find(t => t.value === itemProps.item.rawValue);
                          return (
                            <SelectItem item={itemProps.item}>
                              {type?.label || itemProps.item.rawValue}
                            </SelectItem>
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {(state) => {
                              const selectedType = parameterTypes.find(t => t.value === state.selectedOption());
                              return selectedType?.label || "Select type";
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent />
                      </Select>
                    </div>
                  </div>

                  <TextFieldRoot>
                    <TextFieldLabel>Description</TextFieldLabel>
                    <TextArea
                      value={param.description}
                      onInput={(e) => updateParameter(index(), "description", e.currentTarget.value)}
                      placeholder="Describe what this parameter does"
                      rows={2}
                    />
                  </TextFieldRoot>

                  <div class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`required-${index()}`}
                      checked={param.required}
                      onChange={(e) => updateParameter(index(), "required", e.currentTarget.checked)}
                      class="rounded border-gray-300"
                    />
                    <label for={`required-${index()}`} class="text-sm font-medium">
                      Required parameter
                    </label>
                  </div>

                  {/* Enum Values */}
                  <Show when={param.type === "enum"}>
                    <TextFieldRoot>
                      <TextFieldLabel>Enum Values (comma-separated)</TextFieldLabel>
                      <TextField
                        value={param.enumValues?.join(", ") || ""}
                        onInput={(e) => updateEnumValues(index(), e.currentTarget.value)}
                        placeholder="value1, value2, value3"
                      />
                    </TextFieldRoot>
                  </Show>

                  {/* Array Item Type */}
                  <Show when={param.type === "array"}>
                    <div class="space-y-2">
                      <label class="text-sm font-medium">Array Item Type</label>
                      <Select
                        value={param.arrayItemType || "string"}
                        onChange={(value) => updateParameter(index(), "arrayItemType", value as ParameterType)}
                        options={parameterTypes.filter(t => t.value !== "array").map(t => t.value)}
                        placeholder="Select array item type"
                        itemComponent={(itemProps) => {
                          const type = parameterTypes.find(t => t.value === itemProps.item.rawValue);
                          return (
                            <SelectItem item={itemProps.item}>
                              {type?.label || itemProps.item.rawValue}
                            </SelectItem>
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {(state) => {
                              const selectedType = parameterTypes.find(t => t.value === state.selectedOption());
                              return selectedType?.label || "Select type";
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent />
                      </Select>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};