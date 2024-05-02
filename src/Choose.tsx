import { useState } from 'react';
import './Choose.css';
import Ctx from './Ctx';

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
          style={{ width: '100%' }}
        >Confirm</button>
      </div>
    </div>
  );
}

function Choice({ selection, setSelection, type }: {
  selection: '🙂' | '😍' | undefined;
  setSelection: (selection: '🙂' | '😍' | undefined) => void;
  type: '🙂' | '😍';
}) {
  return (
    <div
      className={`choice ${selection === type && 'selected'}`}
      onClick={() => setSelection(selection === type ? undefined : type)}
    ><div>{type}</div></div>
  );
}
