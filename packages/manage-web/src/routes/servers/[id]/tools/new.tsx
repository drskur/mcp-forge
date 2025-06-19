import { Component, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TextFieldRoot, TextFieldLabel, TextField } from "@/components/ui/textfield";
import { TextArea } from "@/components/ui/textarea";
import { ChevronLeft, Zap, GitBranch } from "lucide-solid";
import { getCachedServerName } from "@/lib/breadcrumb";
import { cn } from "@/lib/utils";

const NewTool: Component = () => {
  const params = useParams();
  const [selectedType, setSelectedType] = createSignal<'lambda' | 'stepfunction' | null>(null);
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");

  // localStorage에서 서버 이름 가져오기 (없으면 ID 사용)
  const serverName = getCachedServerName(params.id) || params.id;

  const invocationTypes = [
    {
      id: 'lambda',
      name: 'AWS Lambda',
      description: 'Serverless computing ideal for fast responses and simple tasks',
      icon: Zap,
      features: ['Fast execution', 'Simple tasks', 'Cost effective']
    },
    {
      id: 'stepfunction',
      name: 'Step Functions',
      description: 'Perfect for complex workflows and long-running tasks',
      icon: GitBranch,
      features: ['Workflow management', 'Long execution time', 'Complex logic']
    }
  ] as const;

  return (
    <MainLayout>
      <div class="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Servers", href: "/servers" },
            { label: serverName, href: `/servers/${params.id}` },
            { label: "New Tool" }
          ]}
        />

        {/* Header */}
        <div class="flex items-center gap-4">
          <Button as="a" href={`/servers/${params.id}`} variant="ghost" size="icon">
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
                    onInput={(e) => setName(e.currentTarget.value)}
                    placeholder="Enter tool name"
                  />
                </TextFieldRoot>
                
                <TextFieldRoot>
                  <TextFieldLabel>Description</TextFieldLabel>
                  <TextArea 
                    value={description()} 
                    onInput={(e) => setDescription(e.currentTarget.value)}
                    placeholder="Describe what this tool does"
                    rows={4}
                  />
                </TextFieldRoot>
              </div>
            </div>
          </div>

          {/* Invocation Type Selection */}
          <div class="rounded-lg border bg-card">
            <div class="p-6">
              <h2 class="text-lg font-semibold mb-4">Select Invocation Type</h2>
              <p class="text-muted-foreground mb-6">
                Choose the execution environment for your tool. Each option has different advantages and use cases.
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invocationTypes.map(type => (
                  <div
                    class={cn(
                      "relative rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-md",
                      selectedType() === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div class="flex items-start gap-4">
                      <div class={cn(
                        "p-2 rounded-md",
                        selectedType() === type.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
                        <type.icon class="h-5 w-5" />
                      </div>

                      <div class="flex-1 space-y-2">
                        <h3 class="font-semibold">{type.name}</h3>
                        <p class="text-sm text-muted-foreground">
                          {type.description}
                        </p>

                        <ul class="text-xs space-y-1">
                          {type.features.map(feature => (
                            <li class="flex items-center gap-2">
                              <div class="h-1 w-1 rounded-full bg-current" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {selectedType() === type.id && (
                      <div class="absolute top-4 right-4">
                        <div class="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedType() && (
                <div class="mt-6 flex justify-end">
                  <Button>
                    Continue
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewTool;