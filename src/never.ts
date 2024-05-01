export default function never(value: never): never {
  console.error('Unexpected value:', value);
  throw new Error('Unexpected value (see console)');
}
