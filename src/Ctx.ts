import z from 'zod';
import { createContext, useContext } from 'react';
import UsableField from './UsableField';
import { Key, PrivateRoom } from 'rendezvous-client';

const MessageInit = z.object({
  from: z.literal('joiner'),
  type: z.literal('init'),
});

const MessageStart = z.object({
  from: z.literal('host'),
  type: z.literal('start'),
});

export default class Ctx {
  page = new UsableField<'Home' | 'Host' | 'Join'>('Home');
  mode: 'Host' | 'Join' = 'Host';
  key = new UsableField(Key.random());
  room = new UsableField<PrivateRoom | undefined>(undefined);

  async connect(): Promise<PrivateRoom> {
    if (this.room.value) {
      if (this.room.value.key.base58() === this.key.value.base58()) {
        return this.room.value;
      }

      this.room.value.socket.close();
    }

    const room = new PrivateRoom(
      'wss://rendezvous.deno.dev',
      this.key.value,
    );

    this.room.set(room);

    // eslint-disable-next-line no-return-await
    return await new Promise(resolve => {
      room.on('open', () => resolve(room));
    });
  }

  async host() {
    this.mode = 'Host';
    const room = await this.connect();

    room.on('message', message => {
      if (!MessageInit.safeParse(message).error) {
        room.send({ from: 'host', type: 'start' });
        console.log('start');
      }
    });
  }

  async join(keyBase58: string) {
    this.mode = 'Join';
    this.key.set(Key.fromBase58(keyBase58));
    const room = await this.connect();
    room.send({ from: 'joiner', type: 'init' });

    room.on('message', message => {
      if (!MessageStart.safeParse(message).error) {
        console.log('start');
      }
    });
  }

  private static context = createContext<Ctx>(
    {} as Ctx,
  );

  static Provider = Ctx.context.Provider;

  static use() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useContext(Ctx.context);
  }
}
