"use server";

import { action, redirect } from "@solidjs/router";
import { McpServerDdbItem, ServerFormData } from "@/types/server";
import {
  createCreatedAtId,
  createServerPK,
  createServerSK,
  ENTITY_TYPES,
  generateId,
  generateShortAlias,
  getCurrentTimestamp,
} from "@/db/helper";
import { putItem } from "@/db/dynamodb";

export const createServer = action(async (formData: ServerFormData) => {
  const id = generateId();
  const timestamp = getCurrentTimestamp();
  const item: McpServerDdbItem = {
    PK: createServerPK(id),
    SK: createServerSK(),
    EntityType: ENTITY_TYPES.SERVER,
    CreatedAtId: createCreatedAtId(timestamp, id),
    id,
    name: formData.name,
    description: formData.description,
    alias: generateShortAlias(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await putItem(item);

  return redirect("/servers");
});


// export const updateServer = action(async (formData: FormData) => {
//   const id = formData.get("id") as string;
//   const name = formData.get("name") as string;
//   const host = formData.get("host") as string;
//   const port = formData.get("port") as string;
//   const description = formData.get("description") as string;
//
//   console.log("서버 업데이트 요청 데이터:", {
//     id,
//     name,
//     host,
//     port: port ? parseInt(port) : undefined,
//     description,
//     timestamp: new Date().toISOString(),
//   });
//
//   // TODO: DynamoDB에서 업데이트 로직 구현
//
//   return redirect("/servers");
// });

// export const deleteServer = action(async (formData: FormData) => {
//   const id = formData.get("id") as string;
//
//   console.log("서버 삭제 요청 데이터:", {
//     id,
//     timestamp: new Date().toISOString(),
//   });
//
//   // TODO: DynamoDB에서 삭제 로직 구현
//
//   return redirect("/servers");
// });
