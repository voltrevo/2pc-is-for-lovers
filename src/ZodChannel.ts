import z from 'zod';

type ZodChannel = {
  send<T>(ZodType: z.ZodType<T>, m: T): void;
  recv<T>(ZodType: z.ZodType<T>): Promise<T>;
}

export function makeZodChannel(
  send: (m: unknown) => void,
  recv: () => Promise<unknown>,
  defer: (m: unknown) => void,
): ZodChannel {
  return {
    send(ZodType, m) {
      ZodType.parse(m);
      send(m);
    },

    async recv(ZodType) {
      const unmatched: unknown[] = [];
      let match;

      while (true) {
        const m = await recv();

        try {
          match = ZodType.parse(m);
          break;
        } catch {
          // This is an ugly workaround to deal with messages arriving out of
          // order. We buffer the messages we don't want and re-insert them into
          // the queue. This solution relies on identifying the correct message
          // by its type. A much better solution would be guaranteeing the order
          // in the rendezvous server.
          unmatched.push(m);

          console.warn('Used out-of-order workaround', m);
        }
      }

      for (const m of unmatched) {
        defer(m);
      }

      return match;
    },
  };
}

export default ZodChannel;
