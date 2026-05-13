const id = Number(import.meta.env.VITE_YANDEX_METRICA_ID);
const isReady = (): boolean => typeof window.ym === 'function' && !!id;

export const hit = (url: string, options: Record<string, unknown> = {}): void => {
  if (!isReady()) return;
  window.ym(id, 'hit', url, options);
};

export const reachGoal = (goalName: string, params: Record<string, unknown> = {}): void => {
  if (!isReady()) return;
  window.ym(id, 'reachGoal', goalName, params);
};

export const setUserParams = (params: Record<string, unknown> = {}): void => {
  if (!isReady()) return;
  window.ym(id, 'userParams', params);
};
