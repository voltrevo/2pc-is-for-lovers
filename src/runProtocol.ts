import z from 'zod';
import * as mpcf from 'mpc-framework';
import { EmpWasmBackend } from 'emp-wasm-backend';
import * as summon from 'summon-ts';
import { RtcPairSocket } from 'rtc-pair-socket';
import assert from './assert';

export default async function runProtocol(
  mode: 'Host' | 'Join',
  socket: RtcPairSocket,
  choice: '🙂' | '😍',
) {
  await summon.init();

  const circuit = summon.compileBoolean('/src/main.ts', 1, {
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
    },
  );

  socket.on('message', msg => {
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

  return output.main ? '😍' : '🙂';
}
