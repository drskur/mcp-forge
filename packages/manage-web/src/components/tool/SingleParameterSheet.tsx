import { Component, Setter, createSignal, createEffect, Show, createMemo } from "solid-js";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { ToolParameter, ParameterType, ArrayItemType } from "@/types/tool";

interface SingleParameterSheetProps {
  open: boolean;
  setOpen: Setter<boolean>;
  parameter: ToolParameter | null;
  onSave: (parameter: ToolParameter) => void;
  isEdit?: boolean;
}

const parameterTypes: { value: ParameterType; label: string }[] = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "bool", label: "Boolean" },
  { value: "enum", label: "Enum" },
  { value: "array", label: "Array" },
];

export const SingleParameterSheet: Component<
  SingleParameterSheetProps
> = props => {
  const [name, setName] = createSignal("");
  const [type, setType] = createSignal<ParameterType>("string");
  const [description, setDescription] = createSignal("");
  const [required, setRequired] = createSignal(false);
  const [enumValues, setEnumValues] = createSignal("");
  const [arrayItemType, setArrayItemType] =
    createSignal<ArrayItemType>("string");

  // 파라미터 데이터의 복사본을 만들어 독립적으로 관리
  const parameterSnapshot = createMemo(() => {
    if (!props.open) return null;
    
    const param = props.parameter;
    if (param) {
      return {
        name: param.name,
        type: param.type,
        description: param.description,
        required: param.required,
        enumValues: param.enumValues?.slice() || [],
        arrayItemType: param.arrayItemType || "string"
      };
    }
    return null;
  });

  // 파라미터 스냅샷으로 폼 초기화
  createEffect(() => {
    const snapshot = parameterSnapshot();
    if (snapshot) {
      setName(snapshot.name);
      setType(snapshot.type);
      setDescription(snapshot.description);
      setRequired(snapshot.required);
      setEnumValues(snapshot.enumValues.join(", "));
      setArrayItemType(snapshot.arrayItemType);
    } else {
      // 새 파라미터 생성 시 초기화
      resetForm();
    }
  });

  const resetForm = () => {
    setName("");
    setType("string");
    setDescription("");
    setRequired(false);
    setEnumValues("");
    setArrayItemType("string");
  };

  const handleSave = () => {
    const parameter: ToolParameter = {
      name: name(),
      type: type(),
      description: description(),
      required: required(),
    };

    if (type() === "enum") {
      parameter.enumValues = enumValues()
        .split(",")
        .map(v => v.trim())
        .filter(v => v);
    }

    if (type() === "array") {
      parameter.arrayItemType = arrayItemType();
    }

    props.onSave(parameter);
    handleOpenChange(false);
  };

  const isFormValid = () => {
    return name().trim() !== "";
  };

  const handleOpenChange = (isOpen: boolean) => {
    props.setOpen(isOpen);
    // Sheet가 닫힐 때 항상 폼 초기화
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Sheet open={props.open} onOpenChange={handleOpenChange}>
      <SheetContent class="sm:max-w-[500px] w-full">
        <SheetHeader>
          <SheetTitle>
            {props.isEdit ? "Edit Parameter" : "Add Parameter"}
          </SheetTitle>
          <SheetDescription>
            Configure the parameter details including type, validation, and
            description.
          </SheetDescription>
        </SheetHeader>

        <div class="flex-1 py-6 space-y-6">
          {/* Name */}
          <TextFieldRoot>
            <TextFieldLabel>Parameter Name</TextFieldLabel>
            <TextField
              value={name()}
              onInput={e => setName(e.currentTarget.value)}
              placeholder="Enter parameter name"
            />
          </TextFieldRoot>

          {/* Type */}
          <div class="space-y-2">
            <label class="text-sm font-medium">Type</label>
            <Select
              value={type()}
              onChange={value => setType(value as ParameterType)}
              options={parameterTypes.map(t => t.value)}
              placeholder="Select type"
              itemComponent={itemProps => {
                const paramType = parameterTypes.find(
                  t => t.value === itemProps.item.rawValue
                );
                return (
                  <SelectItem item={itemProps.item}>
                    {paramType?.label || itemProps.item.rawValue}
                  </SelectItem>
                );
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {state => {
                    const selectedType = parameterTypes.find(
                      t => t.value === state.selectedOption()
                    );
                    return selectedType?.label || "Select type";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent />
            </Select>
          </div>

          {/* Description */}
          <TextFieldRoot>
            <TextFieldLabel>Description</TextFieldLabel>
            <TextArea
              value={description()}
              onInput={e => setDescription(e.currentTarget.value)}
              placeholder="Describe what this parameter does"
              rows={3}
            />
          </TextFieldRoot>

          {/* Required */}
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="required"
              checked={required()}
              onChange={e => setRequired(e.currentTarget.checked)}
              class="rounded border-gray-300"
            />
            <label for="required" class="text-sm font-medium">
              Required parameter
            </label>
          </div>

          {/* Enum Values */}
          <Show when={type() === "enum"}>
            <TextFieldRoot>
              <TextFieldLabel>Enum Values (comma-separated)</TextFieldLabel>
              <TextField
                value={enumValues()}
                onInput={e => setEnumValues(e.currentTarget.value)}
                placeholder="value1, value2, value3"
              />
            </TextFieldRoot>
          </Show>

          {/* Array Item Type */}
          <Show when={type() === "array"}>
            <div class="space-y-2">
              <label class="text-sm font-medium">Array Item Type</label>
              <Select
                value={arrayItemType()}
                onChange={value => setArrayItemType(value as ArrayItemType)}
                options={parameterTypes
                  .filter(t => t.value !== "array")
                  .map(t => t.value)}
                placeholder="Select array item type"
                itemComponent={itemProps => {
                  const paramType = parameterTypes.find(
                    t => t.value === itemProps.item.rawValue
                  );
                  return (
                    <SelectItem item={itemProps.item}>
                      {paramType?.label || itemProps.item.rawValue}
                    </SelectItem>
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {state => {
                      const selectedType = parameterTypes.find(
                        t => t.value === state.selectedOption()
                      );
                      return selectedType?.label || "Select type";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>
            </div>
          </Show>
        </div>

        <SheetFooter>
          <Button onClick={handleSave} disabled={!isFormValid()}>
            {props.isEdit ? "Edit Parameter" : "Add Parameter"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
