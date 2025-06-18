import { Component, Setter, createSignal, createEffect } from "solid-js";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ServerFormData } from "@/types/server";

interface ServerFormSheetProps {
  open: boolean;
  setOpen: Setter<boolean>;
  onCreate?: (data: ServerFormData) => void;
  onEdit?: (data: ServerFormData) => void;
  initialData?: ServerFormData;
}

export const ServerFormSheet: Component<ServerFormSheetProps> = props => {
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");

  // initialData가 변경될 때마다 폼 필드 업데이트
  createEffect(() => {
    if (props.initialData) {
      setName(props.initialData.name || "");
      setDescription(props.initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  });

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = () => {
    const formData = {
      name: name(),
      description: description(),
    };

    if (props.initialData && props.onEdit) {
      props.onEdit(formData);
    } else if (props.onCreate) {
      props.onCreate(formData);
    }

    props.setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    props.setOpen(isOpen);
    // 시트가 닫힐 때 폼 초기화
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Sheet open={props.open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {props.initialData ? "Edit Server" : "Add New Server"}
          </SheetTitle>
          <SheetDescription>
            Configure a new MCP server by providing its details.
          </SheetDescription>
        </SheetHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <label for="name" class="text-sm font-medium">
              Server Name
            </label>
            <input
              id="name"
              type="text"
              value={name()}
              onInput={e => setName(e.target.value)}
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="My Server"
            />
          </div>
          <div class="grid gap-2">
            <label for="description" class="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description()}
              onInput={e => setDescription(e.target.value)}
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="A brief description of the server"
              rows="3"
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSubmit}>
            {props.initialData ? "Edit Server" : "Add Server"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
