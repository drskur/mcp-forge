import { Component } from "solid-js";
import { Search } from "lucide-solid";

interface SearchBarProps {
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: Component<SearchBarProps> = (props) => {
  return (
    <div class="relative">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={props.placeholder || "Search..."}
        value={props.value}
        onInput={e => props.onInput(e.currentTarget.value)}
        class="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  );
};