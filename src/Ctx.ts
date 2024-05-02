import z from 'zod';
import { createContext, useContext } from 'react';
import UsableField from './UsableField';
import { Key, PrivateRoom } from 'rendezvous-client';
import Emitter from './Emitter';
import AsyncQueue from './AsyncQueue';

const MessageInit = z.object({
  from: z.literal('joiner'),
  type: z.literal('init'),
});

const MessageStart = z.object({
  from: z.literal('host'),
  type: z.literal('start'),
});

const MessageReady = z.object({
  from: z.union([z.literal('host'), z.literal('joiner')]),
  type: z.literal('ready'),
});

type PageKind =
  | 'Home'
  | 'Host'
  | 'Join'
  | 'Connecting'
  | 'Choose'
  | 'Waiting'
  | 'Calculating';

export default class Ctx extends Emitter<{ ready(choice: '🙂' | '😍'): void }> {
  page = new UsableField<PageKind>('Home');
  mode: 'Host' | 'Join' = 'Host';
  key = new UsableField(Key.random());
  room = new UsableField<PrivateRoom | undefined>(undefined);
  choicesReversed = Math.random() < 0.5;
  friendReady = false;

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

    room.removeAllListeners('message');

    room.on('message', message => {
      if (!MessageInit.safeParse(message).error) {
        room.send({ from: 'host', type: 'start' });
        this.runProtocol(room);
      }
    });
  }

  async join(keyBase58: string) {
    if (this.key.value.base58() === keyBase58) {
      return;
    }

    this.page.set('Connecting');

    this.mode = 'Join';
    this.key.set(Key.fromBase58(keyBase58));
    const room = await this.connect();
    room.send({ from: 'joiner', type: 'init' });

    const listener = (message: unknown) => {
      if (!MessageStart.safeParse(message).error) {
        room.off('message', listener);
        this.runProtocol(room);
      }
    };

    room.on('message', listener);
  }

  async runProtocol(room: PrivateRoom) {
    this.page.set('Choose');

    const msgQueue = new AsyncQueue<unknown>();
    const myId = this.mode === 'Host' ? 'host' : 'joiner';
    const friendId = this.mode === 'Host' ? 'joiner' : 'host';
    const FriendMsg = z.object({ from: z.literal(friendId) });

    room.on('message', (msg: unknown) => {
      if (!FriendMsg.safeParse(msg).error) {
        msgQueue.push(msg);
      }
    });

    const [choice] = await Promise.all([
      new Promise<'🙂' | '😍'>(resolve => {
        this.once('ready', resolve);
      }),
      msgQueue.shift().then(msg => {
        if (MessageReady.safeParse(msg).error) {
          throw new Error('Unexpected message');
        }

        this.friendReady = true;
      }),
    ]);

    this.page.set('Calculating');
  }

  async send(choice: '🙂' | '😍') {
    this.emit('ready', choice);

    if (!this.friendReady) {
      this.page.set('Waiting');
    }

    this.room.value!.send({
      from: this.mode === 'Host' ? 'host' : 'joiner',
      type: 'ready',
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
