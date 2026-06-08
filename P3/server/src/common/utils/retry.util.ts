import axios from 'axios';

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;

      // 4xx 클라이언트 에러는 재시도하지 않음
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status >= 400 && status < 500) {
          throw err;
        }
      }

      // 마지막 시도였으면 throw
      if (attempt === maxAttempts) {
        break;
      }

      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
