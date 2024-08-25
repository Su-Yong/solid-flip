import { createEffect, on, useContext } from 'solid-js';

import { NestedFlipContext } from './context';

import type { JSX } from 'solid-js/jsx-runtime';

export interface UnflipProps {
  children: JSX.Element;
  id?: string;
}

export const Unflip = (props: UnflipProps) => {
  const nested = useContext(NestedFlipContext);
  let result: JSX.Element | null = null;

  createEffect(on(() => props.id, () => {
    if (!nested) return;

    const isValid = Array.isArray(result) ? result.every((it) => it instanceof Element) : result instanceof Element;
    if (!isValid) {
      console.warn('Unflip children must be a DOM node', result);
      return;
    }

    const parentId = nested.parentId();
    const targetId = props.id ?? parentId;
    if (targetId !== parentId) return;

    nested?.setUnflips([
      ...nested.unflips(),
      ...(Array.isArray(result) ? result as Element[] : [result as Element]),
    ]);
  }));

  return result = props.children;
};
