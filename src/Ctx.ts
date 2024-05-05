import z from 'zod';
import { createContext, useContext } from 'react';
import UsableField from './UsableField';
import { Key, PrivateRoom } from 'rendezvous-client';
import Emitter from './Emitter';
import AsyncQueue from './AsyncQueue';
import runHostProtocol from './runHostProtocol';
import runJoinerProtocol from './runJoinerProtocol';
import { makeZodChannel } from './ZodChannel';
import { TrustedHashRevealer } from './TrustedHashRevealer';
import { MessageInit, MessageReady, MessageStart } from './MessageTypes';

type PageKind =
  | 'Home'
  | 'Share'
  | 'Host'
  | 'Join'
  | 'AutoJoin'
  | 'Connecting'
  | 'Choose'
  | 'Waiting'
  | 'Calculating'
  | 'Result'
  | 'Error';

export default class Ctx extends Emitter<{ ready(choice: '🙂' | '😍'): void }> {
  page = new UsableField<PageKind>('Home');
  mode: 'Host' | 'Join' = 'Host';
  key = new UsableField(Key.random());
  room = new UsableField<PrivateRoom | undefined>(undefined);
  choicesReversed = Math.random() < 0.5;
  friendReady = false;
  result = new UsableField<'🙂' | '😍' | 'malicious' | undefined>(undefined);
  errorMsg = new UsableField<string>('');

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
        this.runProtocol(room).catch(this.handleProtocolError);
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
        this.runProtocol(room).catch(this.handleProtocolError);
      }
    };

    room.on('message', listener);
  }

  async runProtocol(room: PrivateRoom) {
    this.page.set('Choose');

    const msgQueue = new AsyncQueue<unknown>();

    const FriendMsg = z.object({
      from: z.literal(this.mode === 'Host' ? 'joiner' : 'host'),
    });

    room.on('message', (msg: unknown) => {
      if (!FriendMsg.safeParse(msg).error) {
        msgQueue.push(msg);
      }
    });

    const channel = makeZodChannel(
      (msg: unknown) => room.send(msg),
      () => msgQueue.shift(),
      (msg: unknown) => msgQueue.push(msg),
    );

    const [choice, _readyMsg] = await Promise.all([
      new Promise<'🙂' | '😍'>(resolve => {
        this.once('ready', resolve);
      }),
      channel.recv(MessageReady).then(msg => {
        this.friendReady = true;
        return msg;
      }),
    ]);

    this.page.set('Calculating');

    const runSideProtocol = this.mode === 'Host'
      ? runHostProtocol
      : runJoinerProtocol;

    const result = await runSideProtocol(
      channel,
      input => new TrustedHashRevealer(
        'https://trusted-hash-revealer.deno.dev/keccak256',
        input,
      ),
      choice,
    );

    this.result.set(result);

    room.socket.close();

    this.page.set('Result');
  }

  handleProtocolError = (error: unknown) => {
    console.error('Protocol error:', error);
    this.errorMsg.set(`Protocol error: ${JSON.stringify(error)}`);
    this.page.set('Error');
  };

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
