import { Accessor, createContext, createSignal } from 'solid-js';
import { produce } from 'solid-js/store';

import { captureState, DOMState } from '../state';

import type { JSX } from 'solid-js/jsx-runtime';
import type { CSSStyleKeys } from '../types';

export interface FlipContextProps {
  attachedFlipIds: Accessor<Set<string>>;

  firstState: Accessor<Record<string, DOMState | null>>;
  lastState: Accessor<Record<string, DOMState | null>>;
  getFirstState: (id: string) => DOMState | null;
  getLastState: (id: string) => DOMState | null;

  setFirstState: (id: string, state: DOMState | null) => void;
  recordFirstState: (id: string, element: Element, properties?: CSSStyleKeys[]) => void;
  setLastState: (id: string, state: DOMState | null) => void;
  recordLastState: (id: string, element: Element, properties?: CSSStyleKeys[]) => void;

  attach: (id: string) => void;
  detach: (id: string) => void;
}

export const FlipContext = createContext<FlipContextProps>();

const { Provider: BaseFlipProvider } = FlipContext;

export interface FlipProviderProps {
  children: JSX.Element;
}

export const FlipProvider = (props: FlipProviderProps) => {
  const [attachedFlipIds, setAttachedFlipIds] = createSignal(new Set<string>());
  const [firstState, setFirstState] = createSignal<Record<string, DOMState | null>>({});
  const [lastState, setLastState] = createSignal<Record<string, DOMState | null>>({});

  return (
    <BaseFlipProvider
      value={{
        attachedFlipIds,

        firstState,
        lastState,
        getFirstState: (id) => firstState()[id],
        getLastState: (id) => lastState()[id],

        setFirstState: (id, newState) => {
          setFirstState((prev) => ({ ...prev, [id]: newState }));
        },
        recordFirstState: (id, element, properties = []) => {
          const newState = captureState(element, properties);
          if (newState.rect.width === 0 && newState.rect.height === 0) return;

          setFirstState((prev) => ({
            ...prev,
            [id]: newState,
          }));
        },
        setLastState: (id, newState) => {
          setLastState((prev) => ({ ...prev, [id]: newState }));
        },
        recordLastState: (id, element, properties = []) => {
          const newState = captureState(element, properties);
          if (newState.rect.width === 0 && newState.rect.height === 0) return;

          setLastState((prev) => ({
            ...prev,
            [id]: newState,
          }));
        },

        attach: (id) => {
          setAttachedFlipIds(produce((prev) => {
            prev.add(id);
          }));
        },
        detach: (id) => {
          setAttachedFlipIds(produce((prev) => {
            prev.delete(id);
          }));
        },
      }}
    >
      {props.children}
    </BaseFlipProvider>
  );
};
