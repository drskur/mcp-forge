import { Component, createSignal, Show, For } from "solid-js";
import { useParams, query, createAsync } from "@solidjs/router";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
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
import { ChevronLeft, Zap, GitBranch } from "lucide-solid";
import { getCachedServerName } from "@/lib/breadcrumb";
import { cn } from "@/lib/utils";
import { LambdaFunction } from "@/types/lambda";
import { listLambdaFunctions } from "@/aws/lambda/client";

// Query for Lambda functions
const getLambdaFunctionsQuery = query(async () => {
  "use server";
  return await listLambdaFunctions();
}, "lambdaFunctions");

const NewTool: Component = () => {
  const params = useParams();
  const [selectedType, setSelectedType] = createSignal<
    "lambda" | "stepfunction" | null
  >(null);
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [selectedFunctionArn, setSelectedFunctionArn] = createSignal("");
  const [invocationArn, setInvocationArn] = createSignal("");

  // localStorage에서 서버 이름 가져오기 (없으면 ID 사용)
  const serverName = getCachedServerName(params.id) || params.id;

  // Lambda 함수 목록 가져오기 (query 사용)
  const lambdaFunctions = createAsync(async () => {
    return await getLambdaFunctionsQuery();
  });

  const invocationTypes = [
    {
      id: "lambda",
      name: "AWS Lambda",
      description:
        "Serverless computing ideal for fast responses and simple tasks",
      icon: Zap,
    },
    {
      id: "stepfunction",
      name: "Step Functions",
      description: "Perfect for complex workflows and long-running tasks",
      icon: GitBranch,
    },
  ] as const;

  return (
    <MainLayout>
      <div class="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Servers", href: "/servers" },
            { label: serverName, href: `/servers/${params.id}` },
            { label: "New Tool" },
          ]}
        />

        {/* Header */}
        <div class="flex items-center gap-4">
          <Button
            as="a"
            href={`/servers/${params.id}`}
            variant="ghost"
            size="icon"
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <h1 class="text-2xl font-bold">New Tool</h1>
        </div>

        {/* Content */}
        <div class="space-y-6">
          {/* Tool Information */}
          <div class="rounded-lg border bg-card">
            <div class="p-6 space-y-6">
              <div>
                <h2 class="text-lg font-semibold mb-4">Tool Information</h2>
                <p class="text-muted-foreground mb-6">
                  Provide basic information about your tool.
                </p>
              </div>

              <div class="grid grid-cols-1 gap-6">
                <TextFieldRoot>
                  <TextFieldLabel>Name</TextFieldLabel>
                  <TextField
                    value={name()}
                    onInput={e => setName(e.currentTarget.value)}
                    placeholder="Enter tool name"
                  />
                </TextFieldRoot>

                <TextFieldRoot>
                  <TextFieldLabel>Description</TextFieldLabel>
                  <TextArea
                    value={description()}
                    onInput={e => setDescription(e.currentTarget.value)}
                    placeholder="Describe what this tool does"
                    rows={4}
                  />
                </TextFieldRoot>
              </div>
            </div>
          </div>

          {/* Invocation Configuration */}
          <div class="rounded-lg border bg-card">
            <div class="p-6 space-y-6">
              <div>
                <h2 class="text-lg font-semibold mb-4">
                  Invocation Configuration
                </h2>
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
                          selectedType() === type.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => {
                          setSelectedType(type.id);
                          setSelectedFunctionArn(""); // Reset selected function when type changes
                          setInvocationArn(""); // Reset invocation ARN
                        }}
                      >
                        <div class="flex items-start gap-3">
                          <div
                            class={cn(
                              "p-2 rounded-md",
                              selectedType() === type.id
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

                        {selectedType() === type.id && (
                          <div class="absolute top-3 right-3">
                            <div class="h-2 w-2 rounded-full bg-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lambda Function Selection */}
                <Show when={selectedType() === "lambda"}>
                  <div class="space-y-4">
                    <div class="text-sm font-medium">Lambda Function</div>
                    <Select
                      value={selectedFunctionArn()}
                      onChange={value => {
                        setSelectedFunctionArn(value || "");
                        setInvocationArn(value || "");
                      }}
                      options={
                        lambdaFunctions()?.functions?.map(
                          func => func.functionArn
                        ) || []
                      }
                      placeholder="Select a Lambda function"
                      itemComponent={props => {
                        const func = lambdaFunctions()?.functions?.find(
                          f => f.functionArn === props.item.rawValue
                        );
                        return (
                          <SelectItem item={props.item}>
                            {func
                              ? `${func.functionName} (${func.runtime})`
                              : props.item.rawValue}
                          </SelectItem>
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {state => {
                            const selectedArn = state.selectedOption();
                            const func = lambdaFunctions()?.functions?.find(
                              f => f.functionArn === selectedArn
                            );
                            return func
                              ? `${func.functionName} (${func.runtime})`
                              : "Select a Lambda function";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent />
                    </Select>

                    <Show when={invocationArn()}>
                      <div class="p-4 bg-muted rounded-md">
                        <div class="text-sm font-medium mb-2">
                          Invocation ARN:
                        </div>
                        <code class="text-xs bg-background px-2 py-1 rounded font-mono break-all">
                          {invocationArn()}
                        </code>
                      </div>
                    </Show>
                  </div>
                </Show>

                {/* Step Functions Selection (placeholder) */}
                <Show when={selectedType() === "stepfunction"}>
                  <div class="p-4 bg-muted rounded-md">
                    <div class="text-sm text-muted-foreground">
                      Step Functions configuration will be implemented here.
                    </div>
                  </div>
                </Show>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Show
            when={
              selectedType() &&
              (selectedType() !== "lambda" || selectedFunctionArn())
            }
          >
            <div class="flex justify-end">
              <Button>Create Tool</Button>
            </div>
          </Show>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewTool;
