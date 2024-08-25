import { CSSStyleKeys } from './types';

export interface DOMState {
  rect: DOMRect; // transform
  color: string; // background-color
  opacity: string; // opacity
  position: string; // position
  // border-radius
  borderTopLeftXRadius: number;
  borderTopLeftYRadius: number;
  borderTopRightXRadius: number;
  borderTopRightYRadius: number;
  borderBottomLeftXRadius: number;
  borderBottomLeftYRadius: number;
  borderBottomRightXRadius: number;
  borderBottomRightYRadius: number;

  additionalProperties?: Record<string, unknown>;
}

const dimensionToNumber = (value: string, parent: number): number => {
  if (value.endsWith('px')) return parseFloat(value.replace('px', ''));
  if (value.endsWith('%')) return parent * (parseFloat(value.replace('%', '')) / 100);

  return 0;
};
const dimensionsToNumber = (value: string, parent: number): [number, number] => {
  if (!value.includes(' ')) {
    const result = dimensionToNumber(value, parent);

    return [result, result];
  }

  const [x, y] = value.split(' ');
  return [dimensionToNumber(x, parent), dimensionToNumber(y, parent)];
};

export const captureState = (element: Element, additional: CSSStyleKeys[] = []): DOMState => {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const additionalProperties = additional.reduce((acc, property) => ({
    ...acc,
    [property]: style?.[property as keyof CSSStyleDeclaration],
  }), {});

  const scale = style.scale.split(' ').map((it) => {
    const value = Number(it);
    if (!Number.isFinite(value)) return 1;
    return value;
  });
  const [scaleX, scaleY] = scale.length === 1 ? [scale[0], scale[0]] : scale;

  const [borderTopLeftXRadius, borderTopLeftYRadius] = dimensionsToNumber(style.borderTopLeftRadius, size);
  const [borderTopRightXRadius, borderTopRightYRadius] = dimensionsToNumber(style.borderTopRightRadius, size);
  const [borderBottomLeftXRadius, borderBottomLeftYRadius] = dimensionsToNumber(style.borderBottomLeftRadius, size);
  const [borderBottomRightXRadius, borderBottomRightYRadius] = dimensionsToNumber(style.borderBottomRightRadius, size);

  return {
    rect,
    color: style.backgroundColor,
    opacity: style.opacity,
    position: style.position,
    borderTopLeftXRadius: borderTopLeftXRadius * scaleX,
    borderTopLeftYRadius: borderTopLeftYRadius * scaleY,
    borderTopRightXRadius: borderTopRightXRadius * scaleX,
    borderTopRightYRadius: borderTopRightYRadius * scaleY,
    borderBottomLeftXRadius: borderBottomLeftXRadius * scaleX,
    borderBottomLeftYRadius: borderBottomLeftYRadius * scaleY,
    borderBottomRightXRadius: borderBottomRightXRadius * scaleX,
    borderBottomRightYRadius: borderBottomRightYRadius * scaleY,

    additionalProperties,
  };
};
