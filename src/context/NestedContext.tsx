import { Accessor, createContext, createMemo, useContext } from 'solid-js';

import { FlipContext } from './FlipContext';
import { DOMState } from '../state';

import type { JSX } from 'solid-js/jsx-runtime';

export interface NestedFlipContextProps {
  parentId: Accessor<string>;
  firstParentState: Accessor<DOMState | null>;
  lastParentState: Accessor<DOMState | null>;
  unflips: Accessor<Element[]>;
  setUnflips: (unflips: Element[]) => void;
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

  const { getFirstState, getLastState } = context;
  const parent = useContext(NestedFlipContext);

  const firstParentState = createMemo(() => {
    const state = getFirstState(props.id);
    if (!state) return null;

    const parentState = parent?.firstParentState();

    return {
      ...state,
      rect: DOMRect.fromRect({
        x: state.rect.left + (parentState?.rect.left ?? 0),
        y: state.rect.top + (parentState?.rect.top ?? 0),
        width: state.rect.width,
        height: state.rect.height,
      }),
    };
  });
  const lastParentState = createMemo(() => {
    const state = getLastState(props.id);
    if (!state) return null;

    const parentState = parent?.lastParentState();

    return {
      ...state,
      rect: DOMRect.fromRect({
        x: state.rect.left + (parentState?.rect.left ?? 0),
        y: state.rect.top + (parentState?.rect.top ?? 0),
        width: state.rect.width,
        height: state.rect.height,
      }),
    };
  });

  return (
    <NestedFlipContext.Provider
      value={{
        parentId: () => props.id,
        firstParentState,
        lastParentState,
        unflips: () => props.unflips,
        setUnflips: props.setUnflips,
      }}
    >
      {props.children}
    </NestedFlipContext.Provider>
  );
};
