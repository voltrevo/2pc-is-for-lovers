import z from 'zod';

const fromEither = z.union([z.literal('host'), z.literal('joiner')]);

export const MessageInit = z.object({
  from: z.literal('joiner'),
  type: z.literal('init'),
});

export const MessageStart = z.object({
  from: z.literal('host'),
  type: z.literal('start'),
});

export const MessageReady = z.object({
  from: fromEither,
  type: z.literal('ready'),
});

export const MessageMaskCommitment = z.object({
  from: fromEither,
  type: z.literal('maskCommitment'),
  value: z.instanceof(Uint8Array),
});

export const MessageEncryptedSecrets = z.object({
  from: z.literal('host'),
  type: z.literal('encryptedSecrets'),
  value: z.object({
    friendship: z.string(),
    love: z.string(),
  }),
});

export const MessageDecryptRequest = z.object({
  from: z.literal('joiner'),
  type: z.literal('decryptRequest'),
  value: z.string(),
});

export const MessageDecryptResult = z.object({
  from: z.literal('host'),
  type: z.literal('decryptResult'),
  value: z.string(),
});

export const MessageMaskedOutput = z.object({
  from: z.literal('joiner'),
  type: z.literal('maskedOutput'),
  value: z.union([z.literal(0), z.literal(1)]),
});
