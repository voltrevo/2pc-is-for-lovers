export default class AsyncQueue<T> {
  messages: T[] = [];
  pendingResolves: ((msg: T) => void)[] = [];

  push(msg: T) {
    if (this.pendingResolves.length > 0) {
      const pendingResolve = this.pendingResolves.shift()!;
      pendingResolve(msg);
      return;
    }

    this.messages.push(msg);
  }

  async shift(): Promise<T> {
    if (this.messages.length > 0) {
      return this.messages.shift()!;
    }

    return new Promise(resolve => {
      this.pendingResolves.push(resolve);
    });
  }

  stream(handler: (msg: T) => void) {
    const loop = async () => {
      const msg = await this.shift();
      handler(msg);
      loop();
    };

    loop();
  }
}
