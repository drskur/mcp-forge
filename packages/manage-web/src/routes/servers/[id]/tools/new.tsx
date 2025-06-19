import { Component, createSignal, createMemo } from "solid-js";
import { useParams, query, createAsync } from "@solidjs/router";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ChevronLeft } from "lucide-solid";
import { getCachedServerName } from "@/lib/breadcrumb";
import { listLambdaFunctions } from "@/aws/lambda/client";
import { ToolInformationForm } from "@/components/tool/ToolInformationForm";
import { InvocationConfigSection } from "@/components/tool/InvocationConfigSection";
import { ParameterEditor } from "@/components/tool/ParameterEditor";
import { InvocationItem } from "@/types/lambda";
import { ToolParameter } from "@/types/tool";

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
  const [selectedInvocation, setSelectedInvocation] =
    createSignal<InvocationItem | null>(null);
  const [parameters, setParameters] = createSignal<ToolParameter[]>([]);

  // localStorage에서 서버 이름 가져오기 (없으면 ID 사용)
  const serverName = getCachedServerName(params.id) || params.id;

  // Lambda 함수 목록 가져오기 (query 사용)
  const lambdaFunctions = createAsync(async () => {
    return await getLambdaFunctionsQuery();
  });

  // invocationType에 따라 서로 다른 함수를 쿼리
  const invocations = createMemo(() => {
    const type = selectedType();

    if (type === "lambda") {
      const functions = lambdaFunctions();
      if (!functions?.functions) return [];

      return functions.functions.map(func => ({
        invocationType: "lambda" as const,
        name: `${func.FunctionName ?? ""} (${func.Runtime ?? ""})`,
        arn: func.FunctionArn ?? "",
      }));
    } else if (type === "stepfunction") {
      // Step Functions 쿼리는 나중에 구현 예정
      return [];
    }

    return [];
  });

  // 폼 유효성 검사
  const isFormValid = createMemo(() => {
    const toolName = name().trim();
    const toolDescription = description().trim();
    const hasInvocation = selectedInvocation();

    return toolName !== "" && toolDescription !== "" && hasInvocation !== null;
  });

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
          <ToolInformationForm
            name={name()}
            setName={setName}
            description={description()}
            setDescription={setDescription}
          />

          {/* Invocation Configuration */}
          <InvocationConfigSection
            selectedType={selectedType()}
            setSelectedType={setSelectedType}
            selectedInvocation={selectedInvocation()}
            setSelectedInvocation={setSelectedInvocation}
            invocations={invocations}
          />

          {/* Parameters Editor */}
          <ParameterEditor
            parameters={parameters()}
            setParameters={setParameters}
          />

          <div class="flex justify-end">
            <Button disabled={!isFormValid()}>Create Tool</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewTool;
