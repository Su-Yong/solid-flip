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

  const children = (): (HTMLElement | SVGElement)[] => {
    let value: unknown = result;

    if (value instanceof Function) value = value();

    if (Array.isArray(value)) {
      if (!value.every((it) => it instanceof HTMLElement || it instanceof SVGElement)) {
        console.warn('Unflip children must be DOM nodes', value);
        return [];
      }

      return value;
    } else {
      if (!(value instanceof HTMLElement) && !(value instanceof SVGElement)) {
        console.warn('Unflip children looks like not a DOM node', value);
        return [];
      }

      return [value];
    }
  };

  createEffect(on(() => props.id, () => {
    if (!nested) return;

    const childElements = children();
    if (childElements.length === 0) return;

    const parentId = nested.parentId();
    const targetId = props.id ?? parentId;
    if (targetId !== parentId) return;

    nested?.setUnflips([
      ...nested.unflips(),
      ...childElements,
    ]);
  }));

  return result = props.children;
};
