import z from 'zod';
import { createContext, useContext } from 'react';
import UsableField from './UsableField';
import Emitter from './Emitter';
import AsyncQueue from './AsyncQueue';
import runHostProtocol from './runHostProtocol';
import runJoinerProtocol from './runJoinerProtocol';
import { makeZodChannel } from './ZodChannel';
import { TrustedHashRevealer } from './TrustedHashRevealer';
import { MessageInit, MessageReady, MessageStart } from './MessageTypes';
import { Key, RtcPairSocket } from 'rtc-pair-socket';

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
  socket = new UsableField<RtcPairSocket | undefined>(undefined);
  choicesReversed = Math.random() < 0.5;
  friendReady = false;
  result = new UsableField<'🙂' | '😍' | 'malicious' | undefined>(undefined);
  errorMsg = new UsableField<string>('');

  constructor() {
    super();
  }

  async connect(): Promise<RtcPairSocket> {
    if (this.socket.value) {
      if (this.socket.value.pairingCode === this.key.value.base58()) {
        return this.socket.value;
      }

      this.socket.value.close();
    }

    console.log('connecting', this.key.value.base58(), this.mode);

    const socket = new RtcPairSocket(
      this.key.value.base58(),
      this.mode === 'Host' ? 'alice' : 'bob',
    );

    this.socket.set(socket);

    // eslint-disable-next-line no-return-await
    return await new Promise(resolve => {
      socket.on('open', () => resolve(socket));
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

  async runProtocol(socket: RtcPairSocket) {
    this.page.set('Choose');

    const msgQueue = new AsyncQueue<unknown>();

    const FriendMsg = z.object({
      from: z.literal(this.mode === 'Host' ? 'joiner' : 'host'),
    });

    socket.on('message', (msg: unknown) => {
      if (!FriendMsg.safeParse(msg).error) {
        msgQueue.push(msg);
      }
    });

    const channel = makeZodChannel(
      (msg: unknown) => socket.send(msg),
      () => msgQueue.shift(),
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

    socket.close();

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

    this.socket.value!.send({
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
