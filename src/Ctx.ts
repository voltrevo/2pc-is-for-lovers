import { createContext, useContext } from 'react';
import UsableField from './UsableField';

export default class Ctx {
  page = new UsableField<'Home' | 'Host' | 'Join'>('Home');

  private static context = createContext<Ctx>(
    {} as Ctx,
  );

  static Provider = Ctx.context.Provider;

  static use() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useContext(Ctx.context);
  }
}
