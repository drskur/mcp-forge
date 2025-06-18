import { Component } from "solid-js";
import { MoreVertical, Edit, Trash2 } from "lucide-solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { McpServerDdbItem } from "@/types/server";

interface ServerActionsMenuProps {
  server: McpServerDdbItem;
  onEdit?: (server: McpServerDdbItem) => void;
  onDelete?: (server: McpServerDdbItem) => void;
}

export const ServerActionsMenu: Component<ServerActionsMenuProps> = props => {
  const handleEdit = () => {
    if (props.onEdit) {
      props.onEdit(props.server);
    }
  };

  const handleDelete = () => {
    if (props.onDelete) {
      props.onDelete(props.server);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button class="p-1 hover:bg-muted rounded-md transition-colors focus:outline-none">
          <MoreVertical class="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit class="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          class="text-destructive focus:text-destructive"
        >
          <Trash2 class="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
