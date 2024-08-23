export interface DOMState {
  rect: DOMRect; // transform
  color: string; // background-color
  opacity: string; // opacity
  position: string; // position

  computedStyle?: CSSStyleDeclaration;
  // additionalProperties?: Record<string, unknown>;
}
export const captureState = (element: Element): DOMState => {
  const style = getComputedStyle(element);
  return {
    rect: element.getBoundingClientRect(),
    color: style.backgroundColor,
    opacity: style.opacity,
    position: style.position,

    computedStyle: style,
  };
};
