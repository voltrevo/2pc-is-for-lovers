import { useState } from 'react';
import './Choose.css';
import Ctx from './Ctx';
import never from './never';

export default function Choose() {
  const ctx = Ctx.use();
  const [selection, setSelection] = useState<'🙂' | '😍' | undefined>();

  const choices = {
    friendship: <Choice selection={selection} setSelection={setSelection} type='🙂' />,
    love: <Choice selection={selection} setSelection={setSelection} type='😍' />,
  };

  return (
    <div className='choose-page'>
      {
        ctx.choicesReversed
          ? <>
            {choices.love}
            {choices.friendship}
          </>
          : <>
            {choices.friendship}
            {choices.love}
          </>
      }
      <div>
        <button
          disabled={selection === undefined}
          style={{ width: '100%', lineHeight: '1.1em' }}
          className={selection}
        >{buttonText(selection)}</button>
      </div>
    </div>
  );
}

function buttonText(selection: '🙂' | '😍' | undefined) {
  switch (selection) {
  case '🙂': return 'Send Friendship 🙂';
  case '😍': return 'Send Love 😍';
  case undefined: return '(Choose then Confirm)';
  default: never(selection);
  }
}

function Choice({ selection, setSelection, type }: {
  selection: '🙂' | '😍' | undefined;
  setSelection: (selection: '🙂' | '😍' | undefined) => void;
  type: '🙂' | '😍';
}) {
  return (
    <div
      className={`choice ${selection === type && 'selected'} ${type}`}
      onClick={() => setSelection(selection === type ? undefined : type)}
    ><div>{type}</div></div>
  );
}
