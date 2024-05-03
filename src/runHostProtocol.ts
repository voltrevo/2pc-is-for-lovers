import keccak256 from 'keccak256';
import { TrustedHashRevealer } from './TrustedHashRevealer';
import ZodChannel from './ZodChannel';
import {
  MessageDecryptRequest, MessageDecryptResult, MessageEncryptedSecrets, MessageMaskCommitment,
  MessageMaskedOutput,
} from './MessageTypes';
import CommutableCipher from './CommutableCipher';
import CipherMessage from './CipherMessage';
import randomBigint from './randomBigInt';
import p, { isGenerator } from './p';

export default async function runHostProtocol(
  channel: ZodChannel,
  createTrustedHashRevealer: (input: Uint8Array) => TrustedHashRevealer,
  choice: '🙂' | '😍',
) {
  const cc = CommutableCipher.random();

  const mask = new Uint8Array(16);
  crypto.getRandomValues(mask);
  const localMask = mask[0] & 1;
  console.log({ localMask });

  const maskCommitment = keccak256(Buffer.from(mask));

  channel.send(MessageMaskCommitment, {
    from: 'host',
    type: 'maskCommitment',
    value: maskCommitment,
  });

  const friendMaskCommitment = await channel.recv(MessageMaskCommitment);

  const secrets = {
    // If they choose friendship, the result is friendship
    // (regardless of our choice)
    friendship: createMessage('🙂', localMask),

    // If they choose love, the result is love if we chose love
    love: createMessage(choice, localMask),
  };

  const encryptedSecrets = {
    friendship: secrets.friendship.encrypt(cc),
    love: secrets.love.encrypt(cc),
  };

  channel.send(MessageEncryptedSecrets, {
    from: 'host',
    type: 'encryptedSecrets',
    value: {
      friendship: encryptedSecrets.friendship.value.toString(),
      love: encryptedSecrets.love.value.toString(),
    },
  });

  const messageToDecrypt = await channel.recv(MessageDecryptRequest);

  const decrypted = new CipherMessage(
    BigInt(messageToDecrypt.value),
  ).decrypt(cc);

  channel.send(MessageDecryptResult, {
    from: 'host',
    type: 'decryptResult',
    value: decrypted.value.toString(),
  });

  const maskedOutputMessage = await channel.recv(MessageMaskedOutput);

  const maskRevealer = createTrustedHashRevealer(mask);
  maskRevealer.add(friendMaskCommitment.value);

  const resolvedMasks = await maskRevealer.resolve();
  const friendMask = resolvedMasks.getPreimage(friendMaskCommitment.value);
  console.log({ hostMask: mask, joinerMask: friendMask });

  const totalMask = (localMask ^ (friendMask[0] ?? 0)) & 1;
  console.log({ totalMask });
  let output = maskedOutputMessage.value ^ totalMask;

  if (choice === '🙂' && output === 1) {
    console.error([
      'Friend did not follow protocol. Possibly malicious.',
      'Refusing to acknowledge love result.',
    ].join(' '));

    // Note: The user should be careful about revealing that malicious behavior
    // was detected, since this can sometimes reveal information that should
    // have been hidden.

    // By enforcing the correct result of friendship, the malicious client can
    // only show love on their own device, which they are always able to do
    // anyway.
    output = 0;
  }

  return output ? '😍' : '🙂';
}

function createMessage(result: '😍' | '🙂', mask: number) {
  const messageBit = result === '😍' ? 1 : 0;
  const maskedBit = messageBit ^ (mask & 1);

  while (true) {
    let m = randomBigint(p);

    if (Number(m & 1n) !== maskedBit) {
      m++;
    }

    if (isGenerator(m)) {
      return new CipherMessage(m);
    }
  }
}
