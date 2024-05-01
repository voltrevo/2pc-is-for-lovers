import { EventEmitter } from 'events';
import TypedEmitter, { EventMap } from 'typed-emitter';

const Emitter = EventEmitter as {
  new <T extends EventMap>(): TypedEmitter<T>;
};

export default Emitter;
