import keccak256 from 'keccak256';
import CommutableCipher from './CommutableCipher';
import { TrustedHashRevealer } from './TrustedHashRevealer';
import ZodChannel from './ZodChannel';
import {
  MessageDecryptRequest, MessageDecryptResult, MessageEncryptedSecrets, MessageMaskCommitment,
  MessageMaskedOutput,
} from './MessageTypes';
import CipherMessage from './CipherMessage';

export default async function runJoinerProtocol(
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
    from: 'joiner',
    type: 'maskCommitment',
    value: maskCommitment,
  });

  const friendMaskCommitment = await channel.recv(MessageMaskCommitment);

  const encryptedSecretsMessage = await channel.recv(MessageEncryptedSecrets);

  const messageToDecrypt = (
    new CipherMessage(BigInt(
      encryptedSecretsMessage.value[choice === '😍' ? 'love' : 'friendship'],
    )).encrypt(cc)
  );

  channel.send(MessageDecryptRequest, {
    from: 'joiner',
    type: 'decryptRequest',
    value: messageToDecrypt.value.toString(),
  });

  const decryptResultMessage = await channel.recv(MessageDecryptResult);

  const decrypted = new CipherMessage(BigInt(
    decryptResultMessage.value,
  )).decrypt(cc);

  console.log('decrypted', decrypted.value);

  const friendMaskedOutput = Number(decrypted.value & 1n);
  const fullyMaskedOutput = friendMaskedOutput ^ localMask;

  channel.send(MessageMaskedOutput, {
    from: 'joiner',
    type: 'maskedOutput',
    value: fullyMaskedOutput,
  });

  const maskRevealer = createTrustedHashRevealer(mask);
  maskRevealer.add(friendMaskCommitment.value);

  const resolvedMasks = await maskRevealer.resolve();
  const friendMask = resolvedMasks.getPreimage(friendMaskCommitment.value);
  console.log({ hostMask: friendMask, joinerMask: mask });

  const totalMask = (localMask ^ (friendMask[0] ?? 0)) & 1;
  console.log({ totalMask });
  let output = fullyMaskedOutput ^ totalMask;

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
