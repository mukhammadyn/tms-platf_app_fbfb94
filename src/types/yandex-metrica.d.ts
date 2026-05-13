// Type declaration for Yandex Metrica global function
interface Window {
  ym: (counterId: number, action: string, ...args: unknown[]) => void;
}
