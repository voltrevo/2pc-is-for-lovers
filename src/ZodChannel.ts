import z from 'zod';

type ZodChannel = {
  send<T>(ZodType: z.ZodType<T>, m: T): void;
  recv<T>(ZodType: z.ZodType<T>): Promise<T>;
}

export function makeZodChannel(
  send: (m: unknown) => void,
  recv: () => Promise<unknown>,
): ZodChannel {
  return {
    send(ZodType, m) {
      ZodType.parse(m);
      send(m);
    },

    async recv(ZodType) {
      const m = await recv();
      return ZodType.parse(m);
    },
  };
}

export default ZodChannel;
