import z from 'zod';
import * as mpcf from 'mpc-framework';
import { EmpWasmBackend } from 'emp-wasm-backend';
import * as summon from 'summon-ts';
import { RtcPairSocket } from 'rtc-pair-socket';
import assert from './assert';
import AsyncQueue from './AsyncQueue';

export default async function runProtocol(
  mode: 'Host' | 'Join',
  socket: RtcPairSocket,
  choice: '🙂' | '😍',
  onProgress?: (progress: number) => void,
) {
  const msgQueue = new AsyncQueue<unknown>();

  const TOTAL_BYTES = 240730;
  let currentBytes = 0;

  socket.on('message', (msg: Uint8Array) => {
    msgQueue.push(msg);

    currentBytes += msg.byteLength;

    if (onProgress) {
      onProgress(currentBytes / TOTAL_BYTES);
    }
  });

  await summon.init();

  const { circuit } = summon.compileBoolean('/src/main.ts', 1, {
    '/src/main.ts': `
      export default function main(a: number, b: number) {
        return a & b;
      }
    `,
  });

  const mpcSettings = [
    {
      name: 'alice',
      inputs: ['a'],
      outputs: ['main'],
    },
    {
      name: 'bob',
      inputs: ['b'],
      outputs: ['main'],
    },
  ];

  const protocol = new mpcf.Protocol(
    circuit,
    mpcSettings,
    new EmpWasmBackend(),
  );

  const party = mode === 'Host' ? 'alice' : 'bob';
  const otherParty = mode === 'Host' ? 'bob' : 'alice';

  const input = choice === '😍' ? 1 : 0;

  const session = protocol.join(
    party,
    party === 'alice' ? { a: input } : { b: input },
    (to, msg) => {
      assert(to === otherParty);
      socket.send(msg);

      currentBytes += msg.byteLength;

      if (onProgress) {
        onProgress(currentBytes / TOTAL_BYTES);
      }
    },
  );

  msgQueue.stream(msg => {
    if (!(msg instanceof Uint8Array)) {
      console.error(new Error('Expected Uint8Array'));
      return;
    }

    session.handleMessage(otherParty, msg);
  });

  const Output = z.object({
    main: z.number(),
  });

  const output = Output.parse(await session.output());

  if (currentBytes !== TOTAL_BYTES) {
    console.error(
      [
        'Bytes sent & received was not equal to TOTAL_BYTES.',
        ' This causes incorrect progress calculations.',
        ` To fix, updated TOTAL_BYTES to ${currentBytes}.`,
      ].join(''),
    );
  }

  return output.main ? '😍' : '🙂';
}
