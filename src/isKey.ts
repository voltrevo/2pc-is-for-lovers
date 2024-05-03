import bs58 from 'bs58';

export default function isKey(text: string) {
  try {
    return bs58.decode(text).length === 32;
  } catch {
    return false;
  }
}
