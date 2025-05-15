import { Accessor, createContext, useContext } from 'solid-js';

import { FlipContext } from './FlipContext';
import { getDeltaRect } from '../state';

import type { JSX } from 'solid-js/jsx-runtime';

export interface NestedFlipContextProps {
  parentId: Accessor<string>;

  evaluate: () => void;
  registerEvaluate: (fn: () => void) => void;

  beforeEvaluate: () => void;

  add(id: string): void;

  delete(id: string): void;
}

export const NestedFlipContext = createContext<NestedFlipContextProps>();

export interface NestedFlipProviderProps {
  id: string;
  children: JSX.Element;
  unflips: Element[];
  setUnflips: (unflips: Element[]) => void;
}

export const NestedFlipProvider = (props: NestedFlipProviderProps) => {
  const context = useContext(FlipContext);
  if (!context) {
    console.warn('Flip must be used inside a FlipProvider');
    return props.children;
  }

  const childFlipIds = new Set<string>();
  const {
    getFirstState,
    getLastState,
    setFirstState,
  } = context;
  const parent = useContext(NestedFlipContext);

  let once = true;
  const childrenEvaluate: (() => void)[] = [];
  const evaluate = () => {
    if (!once) return;
    once = false;

    const parentFirst = getFirstState(props.id);
    const parentLast = getLastState(props.id);
    if (!parentFirst || !parentLast) return;

    const delta = getDeltaRect(parentFirst, parentLast);
    Array.from(childFlipIds.values()).forEach((flipId) => {
      const first = getFirstState(flipId);
      const last = getLastState(flipId);
      if (!first) return;
      if (!last) return;

      // console.log(
      //   'evaluate',
      //   flipId, 'of', props.id,
      //   '\ndelta:', delta,
      //   '\nrect:', first.rect,
      //   '->',
      //   DOMRect.fromRect({
      //     x: first.rect.left - delta.x,
      //     y: first.rect.top - delta.y,
      //     width: first.rect.width,
      //     height: first.rect.height,
      //   }),
      //   '\nparentRect:', parentFirst.rect, parentLast.rect
      // );
      setFirstState(flipId, {
        ...first,
        rect: DOMRect.fromRect({
          x: first.rect.left - delta.x,
          y: first.rect.top - delta.y,
          width: first.rect.width / delta.width,
          height: first.rect.height / delta.height,
        }),
      });
    });
  };

  return (
    <NestedFlipContext.Provider
      value={{
        parentId: () => props.id,
        evaluate: () => {
          childrenEvaluate.forEach((evaluate) => evaluate());
          childrenEvaluate.length = 0;

          evaluate();
        },
        registerEvaluate: (fn) => {
          childrenEvaluate.push(fn);
        },
        beforeEvaluate: () => {
          once = true;
          parent?.registerEvaluate(evaluate);
        },
        add: (id) => childFlipIds.add(id),
        delete: (id) => childFlipIds.delete(id),
      }}
    >
      {props.children}
    </NestedFlipContext.Provider>
  );
};
