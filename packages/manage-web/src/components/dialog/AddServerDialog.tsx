import { Component, Setter } from "solid-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddServerDialogProps {
  open: boolean;
  setOpen: Setter<boolean>;
}

export const AddServerDialog: Component<AddServerDialogProps> = (props) => {
  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Server</DialogTitle>
          <DialogDescription>
            Configure a new MCP server by providing its details.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <label for="name" class="text-sm font-medium">
              Server Name
            </label>
            <input
              id="name"
              type="text"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="My Server"
            />
          </div>
          <div class="grid gap-2">
            <label for="command" class="text-sm font-medium">
              Command
            </label>
            <input
              id="command"
              type="text"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="npx @modelcontextprotocol/server-memory"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => props.setOpen(false)}>Add Server</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};