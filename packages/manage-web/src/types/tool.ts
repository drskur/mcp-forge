import { DynamoDbItem } from "@/types/dynamodb";

export type ParameterType = "string" | "number" | "bool" | "enum" | "array";
export type ArrayItemType = "string" | "number" | "bool";

export interface ToolParameter {
  name: string;
  type: ParameterType;
  description: string;
  required: boolean;
  // For enum type
  enumValues?: string[];
  // For array type
  arrayItemType?: ArrayItemType;
}

export interface ToolFormData {
  name: string;
  description: string;
  integrationType: "lambda" | "stepfunction";
  integrationArn: string;
  parameters?: ToolParameter[];
}

export interface McpTool {
  id: string;
  name: string;
  description: string;
  integrationType: "lambda" | "stepfunction";
  integrationArn: string;
  parameters?: ToolParameter[];
  createdAt: string;
  updatedAt: string;
}

// DynamoDB One Table Design용 인터페이스
// PK: SERVER#${serverId}
// SK: TOOL#${toolId}
export interface McpToolDdbItem extends DynamoDbItem, McpTool {}
