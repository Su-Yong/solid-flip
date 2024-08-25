import { CSSStyleKeys } from './types';

export interface DOMState {
  rect: DOMRect; // transform
  color: string; // background-color
  opacity: string; // opacity
  position: string; // position

  additionalProperties?: Record<string, unknown>;
}

export const captureState = (element: Element, additional: CSSStyleKeys[] = []): DOMState => {
  const style = getComputedStyle(element);
  const additionalProperties = additional.reduce((acc, property) => ({
    ...acc,
    [property]: style?.[property as keyof CSSStyleDeclaration],
  }), {});

  return {
    rect: element.getBoundingClientRect(),
    color: style.backgroundColor,
    opacity: style.opacity,
    position: style.position,

    additionalProperties,
  };
};
