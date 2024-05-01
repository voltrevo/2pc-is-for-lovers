import { useEffect, useState } from 'react';
import Emitter from './Emitter';

export default class UsableField<T> extends Emitter<{ update(): void }> {
  constructor(public value: T) {
    super();
  }

  use(): T {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [v, setV] = useState(this.value);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(
      () => {
        const listener = () => setV(this.value);
        this.on('update', listener);

        return () => {
          this.off('update', listener);
        };
      },
      [setV],
    );

    return v;
  }

  set(newValue: T) {
    this.value = newValue;
    this.emit('update');
  }
}
