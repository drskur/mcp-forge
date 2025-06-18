import { DynamoDbItem } from "@/types/dynamodb";

export interface ServerFormData {
  name: string;
  description: string;
}

export interface McpServer {
  id: string;
  name: string;
  description: string;
  alias: string;
  createdAt: string;
  updatedAt: string;
}

// DynamoDB One Table Design용 인터페이스
export interface McpServerDdbItem extends DynamoDbItem, McpServer {}
