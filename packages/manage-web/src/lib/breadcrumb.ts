// Breadcrumb을 위한 localStorage 유틸리티

interface BreadcrumbCache {
  serverNames: Record<string, string>; // serverId -> serverName
}

const BREADCRUMB_CACHE_KEY = 'breadcrumb_cache';

// localStorage에서 캐시 가져오기
export const getBreadcrumbCache = (): BreadcrumbCache => {
  if (typeof window === 'undefined') {
    return { serverNames: {} };
  }
  
  try {
    const cached = localStorage.getItem(BREADCRUMB_CACHE_KEY);
    return cached ? JSON.parse(cached) : { serverNames: {} };
  } catch {
    return { serverNames: {} };
  }
};

// localStorage에 캐시 저장
export const setBreadcrumbCache = (cache: BreadcrumbCache): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(BREADCRUMB_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage 저장 실패 시 무시
  }
};

// 서버 이름 저장
export const cacheServerName = (serverId: string, serverName: string): void => {
  const cache = getBreadcrumbCache();
  cache.serverNames[serverId] = serverName;
  setBreadcrumbCache(cache);
};

// 서버 이름 가져오기
export const getCachedServerName = (serverId: string): string | null => {
  const cache = getBreadcrumbCache();
  return cache.serverNames[serverId] || null;
};