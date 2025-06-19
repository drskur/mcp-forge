import { Component, For, JSX } from "solid-js";
import { ChevronRight } from "lucide-solid";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  return (
    <nav class="flex" aria-label="Breadcrumb">
      <ol class="inline-flex items-center">
        <For each={props.items}>
          {(item, index) => (
            <li class="inline-flex items-center">
              {index() > 0 && (
                <ChevronRight class="w-4 h-4 text-muted-foreground mx-3" />
              )}
              {item.href ? (
                <a
                  href={item.href}
                  class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span class="text-sm font-medium text-foreground">
                  {item.label}
                </span>
              )}
            </li>
          )}
        </For>
      </ol>
    </nav>
  );
};