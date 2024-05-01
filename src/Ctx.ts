import { createContext, useContext } from 'react';
import UsableField from './UsableField';
import { Key } from 'rendezvous-client';

export default class Ctx {
  page = new UsableField<'Home' | 'Host' | 'Join'>('Home');
  key = new UsableField(Key.random());

  private static context = createContext<Ctx>(
    {} as Ctx,
  );

  static Provider = Ctx.context.Provider;

  static use() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useContext(Ctx.context);
  }
}
