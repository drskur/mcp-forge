import { Component, Setter, Show, Accessor } from "solid-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, GitBranch } from "lucide-solid";
import { cn } from "@/lib/utils";
import { InvocationItem } from "@/types/lambda";

interface InvocationConfigSectionProps {
  selectedType: "lambda" | "stepfunction" | null;
  setSelectedType: Setter<"lambda" | "stepfunction" | null>;
  selectedInvocation: InvocationItem | null;
  setSelectedInvocation: Setter<InvocationItem | null>;
  invocations: Accessor<InvocationItem[] | undefined>;
}

const invocationTypes = [
  {
    id: "lambda" as const,
    name: "AWS Lambda",
    description:
      "Serverless computing ideal for fast responses and simple tasks",
    icon: Zap,
  },
  {
    id: "stepfunction" as const,
    name: "Step Functions",
    description: "Perfect for complex workflows and long-running tasks",
    icon: GitBranch,
  },
];

export const InvocationConfigSection: Component<
  InvocationConfigSectionProps
> = props => {
  return (
    <div class="rounded-lg border bg-card">
      <div class="p-6 space-y-6">
        <div>
          <h2 class="text-lg font-semibold mb-4">Invocation Configuration</h2>
          <p class="text-muted-foreground mb-6">
            Configure how this tool will be invoked when called.
          </p>
        </div>

        <div class="space-y-6">
          {/* Invocation Type Selection */}
          <div class="space-y-4">
            <div class="text-sm font-medium">Invocation Type</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invocationTypes.map(type => (
                <div
                  class={cn(
                    "relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md",
                    props.selectedType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => {
                    props.setSelectedType(type.id);
                    props.setSelectedInvocation(null); // Reset selected invocation when type changes
                  }}
                >
                  <div class="flex items-start gap-3">
                    <div
                      class={cn(
                        "p-2 rounded-md",
                        props.selectedType === type.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <type.icon class="h-4 w-4" />
                    </div>

                    <div class="flex-1 space-y-1">
                      <h3 class="font-medium text-sm">{type.name}</h3>
                      <p class="text-xs text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>

                  {props.selectedType === type.id && (
                    <div class="absolute top-3 right-3">
                      <div class="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lambda Function Selection */}
          <Show when={props.selectedType === "lambda"}>
            <div class="space-y-4">
              <div class="text-sm font-medium">Lambda Function</div>
              <Select
                value={props.selectedInvocation?.arn || ""}
                onChange={value => {
                  const invocation = props.invocations()?.find(inv => inv.arn === value);
                  if (invocation) {
                    props.setSelectedInvocation(invocation);
                  }
                }}
                options={
                  props.invocations()?.filter(inv => inv.invocationType === "lambda").map(inv => inv.arn) || []
                }
                placeholder="Select a Lambda function"
                itemComponent={itemProps => {
                  const invocation = props.invocations()?.find(
                    inv => inv.arn === itemProps.item.rawValue
                  );
                  return (
                    <SelectItem item={itemProps.item}>
                      {invocation ? invocation.name : itemProps.item.rawValue}
                    </SelectItem>
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {state => {
                      const selectedArn = state.selectedOption();
                      const invocation = props.invocations()?.find(inv => inv.arn === selectedArn);
                      return invocation ? invocation.name : "Select a Lambda function";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>

              <Show when={props.selectedInvocation?.arn}>
                <div class="p-4 bg-muted rounded-md">
                  <div class="text-sm font-medium mb-2">Invocation ARN:</div>
                  <code class="text-xs bg-background px-2 py-1 rounded font-mono break-all">
                    {props.selectedInvocation?.arn}
                  </code>
                </div>
              </Show>
            </div>
          </Show>

          {/* Step Functions Selection (placeholder) */}
          <Show when={props.selectedType === "stepfunction"}>
            <div class="p-4 bg-muted rounded-md">
              <div class="text-sm text-muted-foreground">
                Step Functions configuration will be implemented here.
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
