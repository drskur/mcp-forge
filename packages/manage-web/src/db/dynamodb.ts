"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { McpServerDdbItem } from "@/types/server";
import { ENTITY_TYPES } from "./helper";

const TABLE_NAME = process.env.TABLE_NAME;
const AWS_REGION = import.meta.env.AWS_REGION || "us-east-1";

// DynamoDB 클라이언트 초기화
const client = new DynamoDBClient({
  region: AWS_REGION,
});

const docClient = DynamoDBDocumentClient.from(client);

export const putItem = async (item: McpServerDdbItem): Promise<void> => {
  const tableName = TABLE_NAME;

  if (!tableName) {
    throw new Error("TABLE_NAME environment variable is not set");
  }

  console.log(item);

  try {
    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );

    console.log("Successfully saved item to DynamoDB:", {
      PK: item.PK,
      SK: item.SK,
      EntityType: item.EntityType,
    });
  } catch (error) {
    console.error("Failed to save item to DynamoDB:", error);
    throw error;
  }
};

export const queryItemsByCreatedAt = async <T extends McpServerDdbItem>(
  entityType: keyof typeof ENTITY_TYPES,
  limit?: number,
  indexForward?: boolean
): Promise<T[]> => {
  const tableName = process.env.TABLE_NAME;

  if (!tableName) {
    throw new Error("TABLE_NAME environment variable is not set");
  }

  try {
    const response = await docClient.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: "EntityByCreatedAt",
        KeyConditionExpression: "EntityType = :entityType",
        ExpressionAttributeValues: {
          ":entityType": entityType,
        },
        ScanIndexForward: indexForward,
        Limit: limit,
      })
    );

    return (response.Items as T[]) || [];
  } catch (error) {
    console.error("Failed to query items from DynamoDB:", error);
    throw error;
  }
};
