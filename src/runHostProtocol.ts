import AsyncQueue from './AsyncQueue';

export default async function runHostProtocol(
  msgQueue: AsyncQueue<unknown>,
  choice: '🙂' | '😍',
) {
  return new Promise<never>(() => {});
}
