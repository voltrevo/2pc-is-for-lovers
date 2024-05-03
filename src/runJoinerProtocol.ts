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

  // Note: A malicious host might make one of the options invalid or expensive
  // to compute. This means our abort or delay could reveal information if we
  // simply process our actual option and ignore the other. The simplest
  // solution is to process both options and then just drop the one we don't
  // need.

  const secrets = {
    friendship: new CipherMessage(BigInt(
      encryptedSecretsMessage.value.friendship,
    )),
    love: new CipherMessage(BigInt(
      encryptedSecretsMessage.value.love,
    )),
  };

  if (secrets.love.value === 1n || secrets.friendship.value === 1n) {
    // 1 isn't really a valid secret since we use discrete exponentiation for
    // encryption. 1^key = 1, so the host would know if we picked this secret.
    throw new Error('Invalid secrets');
  }

  const decryptionOptions = {
    love: secrets.love.encrypt(cc),
    friendship: secrets.friendship.encrypt(cc),
  };

  channel.send(MessageDecryptRequest, {
    from: 'joiner',
    type: 'decryptRequest',
    value: decryptionOptions[choice === '😍' ? 'love' : 'friendship']
      .value.toString(),
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
    // have been hidden. (It seems like it might be ok in this app, but in
    // principle, it's a concern.)

    // By enforcing the correct result of friendship, the malicious client can
    // only show love on their own device, which they are always able to do
    // anyway. (On the flip side, if a protocol violation causes a friendship
    // result that 'should' have been love, that's also something they can
    // achieve legitimately by simply choosing friendship.)
    output = 0;
  }

  return output ? '😍' : '🙂';
}
