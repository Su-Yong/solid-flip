import { createSignal, For, JSX, Show } from 'solid-js';

import { Flip } from '../../../src';

import './App.css';

const shuffle = <T, >(array: T[]): T[] => [...array].map((value) => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value);

export const App = () => {
  const [flip1, setFlip1] = createSignal(false);
  const [flip3, setFlip3] = createSignal(false);
  const [flip4, setFlip4] = createSignal(false);
  const [flip5, setFlip5] = createSignal([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  type Item = {
    id: number;
    children?: Item[];
  }
  const [flip6, setFlip6] = createSignal<Item[]>([
    // {
    //   id: 1,
    //   children: [
    //     { id: 1, children: [] },
    //     { id: 2, children: [] },
    //     { id: 3, children: [] },
    //   ],
    // },
    {
      id: 2,
      children: [
        { id: 4, children: [] },
        {
          id: 5,
          children: [
            { id: 5.1, children: [] },
            { id: 5.2, children: [] },
            { id: 5.3, children: [] },
          ],
        },
        {
          id: 6,
          children: [
            { id: 6.1, children: [] },
            { id: 6.2, children: [] },
            { id: 6.3, children: [] },
          ],
        },
      ],
    },
    // {
    //   id: 3,
    //   children: [
    //     {
    //       id: 7,
    //       children: [
    //         { id: 7.1, children: [] },
    //         { id: 7.2, children: [] },
    //         { id: 7.3, children: [] },
    //       ],
    //     },
    //     { id: 8, children: [] },
    //     { id: 9, children: [] },
    //   ],
    // },
    {
      id: 4,
      children: [
        { id: 10, children: [] },
        {
          id: 11,
          children: [
            { id: 11.1, children: [] },
            { id: 11.2, children: [] },
            { id: 11.3, children: [] },
          ],
        },
        { id: 12, children: [] },
      ],
    },
    {
      id: 5,
      children: [
        { id: 13, children: [] },
        { id: 14, children: [] },
        {
          id: 15,
          children: [
            { id: 15.1, children: [] },
            { id: 15.2, children: [] },
            { id: 15.3, children: [] },
          ],
        },
      ],
    }
  ]);

  const onRemove5 = () => setFlip5((prev) => prev.filter((it) => it !== prev.length));
  const onShuffle5 = () => setFlip5(shuffle(flip5()));
  const onAdd5 = () => setFlip5((prev) => [...prev, prev.length + 1]);
  const onShuffle6 = () => {
    const shuffleItem = (item: Item) => {
      const newItem = { ...item };
      if (item.children) newItem.children = shuffle(item.children.map(shuffleItem));

      return newItem;
    }

    setFlip6(shuffle(flip6().map(shuffleItem)));
  };

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
        <h1>Flip + <code>For</code> + Enter/Exit</h1>
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
              <Flip
                enter
                exit
                preserve={'position'}
                id={`flip5-${item}`}
                with={flip5()}
              >
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
                  <For each={item.children}>
                    {(subItem) => (
                      <Flip id={`flip6-${subItem.id}`} with={flip6()}>
                        <div class={'card grid'}>
                          {subItem.id}
                          <For each={subItem.children}>
                            {(subSubItem) => (
                              <Flip id={`flip6-${subSubItem.id}`} with={flip6()}>
                                <Card>
                                  {subSubItem.id}
                                </Card>
                              </Flip>
                            )}
                          </For>
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
    </div>
  );
};

interface CardProps {
  children: JSX.Element;
}

const Card = (props: CardProps) => {
  return (
    <div class={'card'}>
      {props.children}
    </div>
  );
};
