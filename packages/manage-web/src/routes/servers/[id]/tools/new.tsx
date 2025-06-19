import { Component } from "solid-js";
import { useParams } from "@solidjs/router";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ChevronLeft } from "lucide-solid";
import { getCachedServerName } from "@/lib/breadcrumb";

const NewTool: Component = () => {
  const params = useParams();
  
  // localStorage에서 서버 이름 가져오기 (없으면 ID 사용)
  const serverName = getCachedServerName(params.id) || params.id;

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
        <div class="rounded-lg border bg-card">
          <div class="p-6">
            <p class="text-muted-foreground">Tool creation form will be implemented here.</p>
            <p class="text-sm text-muted-foreground mt-2">
              Server ID: {params.id}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewTool;