import {
  createComputed,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  getOwner,
  mergeProps,
  on,
  onCleanup,
  onMount,
  runWithOwner,
  splitProps,
  useContext
} from 'solid-js';
import { isDev } from 'solid-js/web';

import { captureState, DOMState } from './state';
import { FlipContext, NestedFlipContext, NestedFlipProvider } from './context';

import type { JSX } from 'solid-js/jsx-runtime';
import type { CSSStyleKeys } from './types';

type ArrayOr<T> = T | T[];

export interface FlipProps {
  id: string;

  /* general props */
  enabled?: boolean;

  /* animation props */
  duration?: number;
  easing?: string;
  properties?: ArrayOr<CSSStyleKeys>;

  /* trigger */
  with?: ArrayOr<unknown>;
  enter?: string | boolean;
  exit?: string | boolean;
  preserve?: false | 'scale' | 'position' | 'all';

  /* debug */
  debug?: boolean;

  children: JSX.Element;
}

export const Flip = (props: FlipProps) => {
  const context = useContext(FlipContext);
  const nested = useContext(NestedFlipContext);

  if (!context) {
    console.warn('Flip must be used inside a FlipProvider');
    return props.children;
  }

  const {
    attachedFlipIds,
    getFirstState,
    setFirstState,
    setLastState,
    recordFirstState,
    detach,
    attach,
    defaultConfig,
  } = context;

  const [
    animationProps,
    timingProps,
    triggerProps,
    local,
  ] = splitProps(
    mergeProps({
      enabled: true,
      duration: defaultConfig.duration,
      easing: defaultConfig.easing,
      preserve: defaultConfig.preserve,
      properties: defaultConfig.properties as FlipProps['properties'],
      with: [],
      debug: defaultConfig.debug,
    }, props),
    ['duration', 'easing', 'properties'],
    ['enter', 'exit', 'preserve'],
    ['with'],
  );

  const [unflips, setUnflips] = createSignal<Element[]>([]);

  const triggerWith = createMemo(() => {
    const value = triggerProps.with;

    return Array.isArray(value) ? value : [value];
  });
  const properties = createMemo(() => {
    const value = animationProps.properties;

    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  });
  const enterClass = createMemo(() => {
    const value = timingProps.enter;

    if (typeof value === 'string') return value;
    if (value === true) return 'enter';
    return null;
  });
  const exitClass = createMemo(() => {
    const value = timingProps.exit;

    if (typeof value === 'string') return value;
    if (value === true) return 'exit';
    return null;
  });

  let result: JSX.Element | null = null;
  let animation: Animation | null = null;

  const child = () => {
    let value: unknown = result;

    if (value instanceof Function) value = value();
    if (Array.isArray(value)) {
      console.warn('Flip children must be a "single" DOM node', value);
      return null;
    }
    if (!(value instanceof HTMLElement) && !(value instanceof SVGElement)) {
      console.warn('Flip children looks like not a DOM node', value);
      return null;
    }

    return value as HTMLElement | SVGElement;
  };

  const animate = (firstState: DOMState, lastState: DOMState, {
    biasX = 0,
    biasY = 0,
    biasWidth = 1,
    biasHeight = 1,
  } = {}) => {
    const firstParentState = nested?.firstParentState();
    const lastParentState = nested?.lastParentState();

    let parentDeltaX = 0;
    let parentDeltaY = 0;
    let parentDeltaWidth = 1;
    let parentDeltaHeight = 1;
    if (lastParentState && firstParentState) {
      const parentOffsetX = (firstParentState.rect.width - lastParentState.rect.width) / 2;
      const parentOffsetY = (firstParentState.rect.height - lastParentState.rect.height) / 2;
      parentDeltaX = firstParentState.rect.left - lastParentState.rect.left + parentOffsetX;
      parentDeltaY = firstParentState.rect.top - lastParentState.rect.top + parentOffsetY;
      parentDeltaWidth = firstParentState.rect.width / lastParentState.rect.width;
      parentDeltaHeight = firstParentState.rect.height / lastParentState.rect.height;
    }

    const offsetX = (firstState.rect.width - lastState.rect.width) / 2;
    const offsetY = (firstState.rect.height - lastState.rect.height) / 2;

    const deltaX = -1 * parentDeltaX + firstState.rect.left - lastState.rect.left + offsetX;
    const deltaY = -1 * parentDeltaY + firstState.rect.top - lastState.rect.top + offsetY;
    const deltaWidth = (firstState.rect.width / lastState.rect.width) / parentDeltaWidth;
    const deltaHeight = (firstState.rect.height / lastState.rect.height) / parentDeltaHeight;
    const safeDeltaWidth = (deltaWidth === 0) ? 1 : deltaWidth;
    const safeDeltaHeight = deltaHeight === 0 ? 1 : deltaHeight;

    const unflipStates = unflips().map((it) => captureState(it, properties()));

    const allowed = properties();
    const startKeyframe: Keyframe = {};

    if (allowed) {
      allowed.forEach((property) => {
        const value = firstState.additionalProperties?.[property];

        if (value) startKeyframe[property as string] = value as string;
        else console.warn(`Property "${property}" is not found in the first state`);
      });
    }

    const allowedTransform = allowed.includes('transform');
    const allowedBorderRadius = allowed.includes('border') || allowed.includes('borderRadius');
    if (allowed.includes('translate') || allowedTransform) startKeyframe.translate = `${deltaX}px ${deltaY}px`;
    if (allowed.includes('scale') || allowedTransform) startKeyframe.scale = `${deltaWidth} ${deltaHeight}`;
    if (allowed.includes('color') || allowed.some((it) => it.startsWith('background'))) startKeyframe.backgroundColor = firstState.color;
    if (allowed.includes('opacity')) startKeyframe.opacity = firstState.opacity;
    if (allowed.includes('borderTopLeftRadius') || allowedBorderRadius) startKeyframe.borderTopLeftRadius = `${firstState.borderTopLeftXRadius / safeDeltaWidth}px ${firstState.borderTopLeftYRadius / safeDeltaHeight}px`;
    if (allowed.includes('borderTopRightRadius') || allowedBorderRadius) startKeyframe.borderTopRightRadius = `${firstState.borderTopRightXRadius / safeDeltaWidth}px ${firstState.borderTopRightYRadius / safeDeltaHeight}px`;
    if (allowed.includes('borderBottomLeftRadius') || allowedBorderRadius) startKeyframe.borderBottomLeftRadius = `${firstState.borderBottomLeftXRadius / safeDeltaWidth}px ${firstState.borderBottomLeftYRadius / safeDeltaHeight}px`;
    if (allowed.includes('borderBottomRightRadius') || allowedBorderRadius) startKeyframe.borderBottomRightRadius = `${firstState.borderBottomRightXRadius / safeDeltaWidth}px ${firstState.borderBottomRightYRadius / safeDeltaHeight}px`;

    const endKeyframe: Keyframe = {};
    if (biasX || biasY) endKeyframe.translate = `${biasX ?? 0}px ${biasY ?? 0}px`;
    if (biasWidth !== 1 || biasHeight !== 1) endKeyframe.scale = `${biasWidth} ${biasHeight}`;

    const childElement = child();
    if (!childElement) return null;

    animation = childElement.animate(
      [{ transformOrigin: '50% 50%', ...startKeyframe }, endKeyframe],
      {
        duration: animationProps.duration,
        easing: animationProps.easing,
        fill: 'both',
      },
    ) ?? null;
    animation.addEventListener('finish', () => animation = null, { once: true });

    const animateUnflips = unflips().map((unflip, index) => {
      const firstUnflipState = unflipStates[index];
      const x = firstUnflipState.rect.left - lastState.rect.left;
      const y = firstUnflipState.rect.top - lastState.rect.top;

      return () => {
        const target = unflip as HTMLElement;
        const [parentScaleX, parentScaleY] = getComputedStyle(childElement).scale.split(' ').map(Number);

        if (!Number.isFinite(parentScaleX) || !Number.isFinite(parentScaleY)) {
          target.style.removeProperty('scale');
          target.style.removeProperty('translate');
          return true;
        }

        const scaleX = 1 / parentScaleX;
        const scaleY = 1 / parentScaleY;
        const offsetX = firstUnflipState.rect.width * (scaleX - 1) / 2 + x * (scaleX - 1);
        const offsetY = firstUnflipState.rect.height * (scaleY - 1) / 2 + y * (scaleY - 1);

        target.style.setProperty('translate', `${offsetX}px ${offsetY}px`);
        target.style.setProperty('scale', `${scaleX} ${scaleY}`);

        return false;
      };
    });

    const animateAll = () => {
      const isEnd = animateUnflips.map((it) => it());
      if (isEnd.every(Boolean)) return;

      requestAnimationFrame(animateAll);
    };
    animateAll();

    if (isDev && local.debug) {
      const showDebugProps = () => {
        if (!animation) {
          Object.keys(startKeyframe).forEach((key) => {
            delete childElement.dataset[`flip${key[0].toUpperCase()}${key.slice(1)}`];
          });

          return;
        }

        const style = getComputedStyle(childElement);

        Object.keys(startKeyframe).forEach((key) => {
          childElement.dataset[`flip${key[0].toUpperCase()}${key.slice(1)}`] = style[key as keyof CSSStyleDeclaration] as string;
        });
        requestAnimationFrame(showDebugProps);
      };

      showDebugProps();
    }

    return animation;
  };

  const flip = () => {
    if (!local.enabled) return;

    const childElement = child();
    if (!childElement) return;

    const enterClassName = enterClass();
    let firstState = getFirstState(local.id);
    if (!firstState && enterClassName) {
      childElement.classList.add(enterClassName);
      firstState = captureState(childElement, properties());
      childElement.classList.remove(enterClassName);

      setFirstState(local.id, firstState);
    }

    if (firstState) {
      animation?.cancel();
      animation = null;
      const lastState = captureState(childElement, properties());
      setLastState(local.id, lastState);

      requestAnimationFrame(() => {
        animate(firstState, lastState);
      });
    } else {
      recordFirstState(local.id, childElement, properties());
    }
  };

  onMount(() => {
    const childElement = child();
    if (!childElement) return;

    if (!childElement.parentElement) return;
    flip();
  });

  createComputed(on(triggerWith, () => {
    const childElement = child();
    if (!childElement) return;

    recordFirstState(local.id, childElement, properties());
  }, { defer: true }));

  createRenderEffect(on(() => local.id, () => {
    attach(local.id);
  }));

  createEffect(on(triggerWith, () => {
    flip();
  }, { defer: true }));

  if (isDev) {
    createEffect(on(() => local.debug, (isDebug) => {
      const childElement = child();
      if (!childElement) return;

      if (isDebug) childElement.dataset.flipId = local.id;
      else delete childElement.dataset.flipId;
    }));
  }

  onCleanup(() => {
    const childElement = child();
    if (!childElement) return;

    detach(local.id);
    const newState = captureState(childElement, properties());
    setFirstState(local.id, newState);

    const owner = getOwner();
    const exitClassName = exitClass();
    const id = local.id;
    const beforeElement = childElement.previousElementSibling;
    const afterElement = childElement.nextElementSibling;
    const parentElement = childElement.parentElement;

    if (local.enabled) {
      queueMicrotask(() => {
        runWithOwner(owner, () => {
          if (exitClassName && parentElement) {
            const childElement = child();
            if (!childElement) return;

            animation?.cancel();
            animation = null;
            childElement.classList.add(exitClassName);

            if (afterElement) afterElement.insertAdjacentElement('beforebegin', childElement);
            else if (beforeElement) beforeElement.insertAdjacentElement('afterend', childElement);
            else parentElement.append(childElement);

            const lastState = captureState(childElement, properties());
            const rect: Required<DOMRectInit> = {
              x: lastState.rect.x,
              y: lastState.rect.y,
              width: lastState.rect.width,
              height: lastState.rect.height,
            };

            const isNewStatePositionAbsolute = newState.position === 'absolute' || newState.position === 'fixed';
            const isLastStatePositionAbsolute = lastState.position === 'absolute' || lastState.position === 'fixed';
            const options = {
              biasX: 0,
              biasY: 0,
              biasWidth: 1,
              biasHeight: 1,
            };

            const isPositionPreserve = timingProps.preserve === 'position' || timingProps.preserve === 'all';
            const isScalePreserve = timingProps.preserve === 'scale' || timingProps.preserve === 'all';
            if (isNewStatePositionAbsolute && !isLastStatePositionAbsolute) {
              if (isPositionPreserve) options.biasX = lastState.rect.x - newState.rect.x;
              if (isPositionPreserve) options.biasY = lastState.rect.y - newState.rect.y;
              if (isScalePreserve) options.biasWidth = lastState.rect.width / newState.rect.width;
              if (isScalePreserve) options.biasHeight = lastState.rect.height / newState.rect.height;
            }
            if (!isNewStatePositionAbsolute && isLastStatePositionAbsolute) {
              if (isPositionPreserve) options.biasX = newState.rect.x - lastState.rect.x + (newState.rect.width - lastState.rect.width) / 2;
              if (isPositionPreserve) options.biasY = newState.rect.y - lastState.rect.y + (newState.rect.height - lastState.rect.height) / 2;
              if (isScalePreserve) options.biasWidth = newState.rect.width / lastState.rect.width;
              if (isScalePreserve) options.biasHeight = newState.rect.height / lastState.rect.height;
            }
            lastState.rect = DOMRect.fromRect(rect);

            animate(newState, lastState, options)?.addEventListener('finish', () => {
              childElement.remove();
            });
          }
        });
      });
    }

    setTimeout(() => { // HACK: nextFrame
      runWithOwner(owner, () => {
        const ids = attachedFlipIds();
        if (ids.has(id)) return;

        setFirstState(id, null);
      });
    }, 16);
  });

  return (
    <NestedFlipProvider
      id={local.id}
      unflips={unflips()}
      setUnflips={setUnflips}
    >
      {result = props.children}
    </NestedFlipProvider>
  );
};
