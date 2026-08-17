// mock 응답에 약간의 지연을 줘서 로딩 상태 UI도 같이 확인할 수 있게 함
export function mockDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
