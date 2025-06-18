export interface DynamoDbItem {
  // Primary Key
  PK: string; // "SERVER#{id}"
  SK: string; // "METADATA"

  // GSI: EntityByCreatedAt
  EntityType: string; // "SERVER"
  CreatedAtId: string; // "{createdAt}#{id}"
}
