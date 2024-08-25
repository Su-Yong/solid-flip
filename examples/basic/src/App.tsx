import { createSignal, For, Show } from 'solid-js';

import { Flip, Unflip } from '../../../';

import './App.css';

const shuffle = <T, >(array: T[]): T[] => [...array].map((value) => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value);

export const App = () => {
  const [flip1, setFlip1] = createSignal(false);
  const [flip2, setFlip2] = createSignal(false);
  const [flip3, setFlip3] = createSignal(false);
  const [flip4, setFlip4] = createSignal(false);
  const [flip5, setFlip5] = createSignal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [flip6, setFlip6] = createSignal<{
    id: number;
    items: number[];
  }[]>([
    { id: 1, items: [1, 2, 3, 4, 5] },
    { id: 2, items: [6, 7, 8, 9, 10] },
    { id: 3, items: [11, 12, 13, 14, 15] },
    { id: 4, items: [16, 17, 18, 19, 20] },
    { id: 5, items: [21, 22, 23, 24, 25] },
    { id: 6, items: [26, 27, 28, 29, 30] },
  ]);
  const [flip7, setFlip7] = createSignal(1);

  const onRemove5 = () => setFlip5((prev) => prev.sort((a, b) => a - b).slice(0, prev.length - 1));
  const onShuffle5 = () => setFlip5(shuffle(flip5()));
  const onAdd5 = () => setFlip5((prev) => [...prev, prev.length + 1]);
  const onShuffle6 = () => setFlip6(shuffle(flip6().map((group) => ({ ...group, items: shuffle(group.items) }))));
  const onRemove7 = () => setFlip7((prev) => Math.max(1, prev - 1));
  const onAdd7 = () => setFlip7((prev) => Math.min(3, prev + 1));

  return (
    <div class={'app'}>
      <section>
        <h1>Flip with <code>Show</code></h1>
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
              Click Again!
            </div>
          </Flip>
        </Show>
      </section>

      <section>
        <h1>Flip with <code>Property(with)</code></h1>
        <Flip id={'flip2'} with={flip2()}>
          <div class={flip2() ? 'card blue fullscreen' : 'card red'} onClick={() => setFlip2(!flip2())}>
            {flip2() ? 'Click Again!' : 'Click!'}
          </div>
        </Flip>
      </section>

      <section>
        <h1>Flip with <code>Multiple Property(with)</code></h1>
        <div class={'header'}>
          <button onClick={() => setFlip3(!flip3())}>
            Toggle color
          </button>
          <button onClick={() => setFlip4(!flip4())}>
            Toggle opacity
          </button>
        </div>
        <Flip id={'flip3'} with={[flip3(), flip4()]}>
          <div
            classList={{
              card: true,
              [flip3() ? 'blue' : 'red']: true,
              opacity: flip4(),
            }}
          >
            Flip
          </div>
        </Flip>
      </section>

      <section>
        <h1>Flip + <code>For</code></h1>
        <div class={'header'}>
          <button onClick={onRemove5}>
            -
          </button>
          <button onClick={onShuffle5}>
            shuffle
          </button>
          <button onClick={onAdd5}>
            +
          </button>
        </div>
        <div class={'grid'}>
          <For each={flip5()}>
            {(item) => (
              <Flip id={`flip5-${item}`} with={flip5()}>
                <div class={'card'}>
                  {item}
                </div>
              </Flip>
            )}
          </For>
        </div>
      </section>

      <section>
        <h1>Nested Flip</h1>
        <div class={'header'}>
          <button onClick={onShuffle6}>
            shuffle
          </button>
        </div>
        <div class={'grid'}>
          <For each={flip6()}>
            {(item) => (
              <Flip id={`flip6-group-${item.id}`} with={flip6()}>
                <div class={'card grid'}>
                  <For each={item.items}>
                    {(subItem) => (
                      <Flip id={`flip6-${subItem}`} with={flip6()}>
                        <div class={'card'}>
                          {subItem}
                        </div>
                      </Flip>
                    )}
                  </For>
                </div>
              </Flip>
            )}
          </For>
        </div>
      </section>

      <section>
        <h1>Unflip</h1>
        <div class={'header'}>
          <button onClick={onRemove7}>
            -
          </button>
          {flip7()}
          <button onClick={onAdd7}>
            +
          </button>
        </div>

        <Flip id={'flip7'} with={flip7()}>
          <div
            class={'card'}
            style={{
              width: flip7() === 2 ? '500px' : '250px',
              height: flip7() === 3 ? '500px' : '250px'
            }}
          >
            <Unflip>
              <div>
                <div class={'card red'}>
                  Inner Component 1
                </div>
                <div class={'card blue'}>
                  Inner Component 2
                </div>
              </div>
            </Unflip>
          </div>
        </Flip>

      </section>
    </div>
  );
};
