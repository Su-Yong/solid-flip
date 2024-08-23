import { Accessor, createContext, createSignal } from 'solid-js';

import type { JSX } from 'solid-js/jsx-runtime';
import { captureState, DOMState } from '../state';

export interface FlipContextProps {
  firstState: Accessor<Record<string, DOMState | null>>;
  lastState: Accessor<Record<string, DOMState | null>>;
  getFirstState: (id: string) => DOMState | null;
  getLastState: (id: string) => DOMState | null;

  setFirstState: (id: string, state: DOMState | null) => void;
  recordFirstState: (id: string, element: Element) => void;
  setLastState: (id: string, state: DOMState | null) => void;
  recordLastState: (id: string, element: Element) => void;
}

export const FlipContext = createContext<FlipContextProps>();

const { Provider: BaseFlipProvider } = FlipContext;

export interface FlipProviderProps {
  children: JSX.Element;
}

export const FlipProvider = (props: FlipProviderProps) => {
  const [firstState, setFirstState] = createSignal<Record<string, DOMState | null>>({});
  const [lastState, setLastState] = createSignal<Record<string, DOMState | null>>({});

  return (
    <BaseFlipProvider
      value={{
        firstState,
        lastState,
        getFirstState: (id) => firstState()[id],
        getLastState: (id) => lastState()[id],

        setFirstState: (id, newState) => {
          setFirstState((prev) => ({ ...prev, [id]: newState }));
        },
        recordFirstState: (id, element) => {
          const newState = captureState(element);
          if (newState.rect.width === 0 && newState.rect.height === 0) return;

          setFirstState((prev) => ({
            ...prev,
            [id]: newState,
          }));
        },
        setLastState: (id, newState) => {
          setLastState((prev) => ({ ...prev, [id]: newState }));
        },
        recordLastState: (id, element) => {
          const newState = captureState(element);
          if (newState.rect.width === 0 && newState.rect.height === 0) return;

          setLastState((prev) => ({
            ...prev,
            [id]: newState,
          }));
        },
      }}
    >
      {props.children}
    </BaseFlipProvider>
  );
};
