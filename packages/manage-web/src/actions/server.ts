"use server";

import { action, redirect } from "@solidjs/router";
import { McpServerDdbItem, ServerFormData } from "@/types/server";
import {
  createCreatedAtId,
  createServerPK,
  createServerSK,
  ENTITY_TYPES,
  generateShortId,
  getCurrentTimestamp,
} from "@/db/helper";
import { deleteItem, putItem } from "@/db/dynamodb";

export const createServer = action(async (formData: ServerFormData) => {
  const id = generateShortId();
  const timestamp = getCurrentTimestamp();
  const item: McpServerDdbItem = {
    PK: createServerPK(id),
    SK: createServerSK(),
    EntityType: ENTITY_TYPES.SERVER,
    CreatedAtId: createCreatedAtId(timestamp, id),
    id,
    name: formData.name,
    description: formData.description,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await putItem(item);

  return redirect("/servers");
});

export const updateServer = action(
  async (item: McpServerDdbItem, formData: ServerFormData) => {
    item.name = formData.name;
    item.description = formData.description;
    item.updatedAt = getCurrentTimestamp();

    await putItem(item);

    return redirect("/servers");
  }
);

export const deleteServer = action(async (item: McpServerDdbItem) => {
  await deleteItem(item.PK, item.SK);

  return redirect("/servers");
});
