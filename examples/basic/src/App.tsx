import { createSignal, Show } from 'solid-js';

import { Flip } from '../../../';

import './App.css';

export const App = () => {
  const [flip1, setFlip1] = createSignal(false);

  return (
    <div class={'app'}>
      <Show
        when={flip1()}
        fallback={
          <Flip id={'flip1'}>
            <div class={'card red'} onClick={() => setFlip1(!flip1())}>
              Click!
            </div>
          </Flip>
        }
      >
        <Flip id={'flip1'}>
          <div class={'card blue fullscreen'} onClick={() => setFlip1(!flip1())}>
            Click again!
          </div>
        </Flip>
      </Show>
    </div>
  );
};
