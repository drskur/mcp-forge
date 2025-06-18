// PK 생성 함수들
export const createServerPK = (serverId: string): string =>
  `SERVER#${serverId}`;

// SK 생성 함수들
export const createServerSK = (): string => "METADATA";

// GSI 키 생성 함수들
export const createCreatedAtId = (createdAt: string, id: string): string =>
  `${createdAt}#${id}`;

// 범용 헬퍼 함수들
export const generateId = (): string => crypto.randomUUID();
export const getCurrentTimestamp = (): string => new Date().toISOString();
export const generateShortAlias = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 10 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};

// EntityType 상수들
export const ENTITY_TYPES = {
  SERVER: "SERVER",
} as const;
