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

  /* animation props */
  duration?: number;
  easing?: string;
  properties?: ArrayOr<CSSStyleKeys>;
  enter?: string | boolean;
  exit?: string | boolean;

  /* trigger */
  with?: ArrayOr<unknown>;

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
      duration: defaultConfig.duration,
      easing: defaultConfig.easing,
      with: [],
      debug: defaultConfig.debug,
    }, props),
    ['duration', 'easing', 'properties'],
    ['enter', 'exit'],
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

  const animate = (firstState: DOMState, lastState: DOMState) => {
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
    const safeDeltaWidth = deltaWidth === 0 ? 1 : deltaWidth;
    const safeDeltaHeight = deltaHeight === 0 ? 1 : deltaHeight;

    const unflipStates = unflips().map((it) => captureState(it, properties()));

    const startKeyframe: Keyframe = {
      translate: `${deltaX}px ${deltaY}px`,
      scale: `${deltaWidth} ${deltaHeight}`,
      backgroundColor: firstState.color,
      opacity: firstState.opacity,
      borderTopLeftRadius: `${firstState.borderTopLeftXRadius / safeDeltaWidth}px ${firstState.borderTopLeftYRadius / safeDeltaHeight}px`,
      borderTopRightRadius: `${firstState.borderTopRightXRadius / safeDeltaWidth}px ${firstState.borderTopRightYRadius / safeDeltaHeight}px`,
      borderBottomLeftRadius: `${firstState.borderBottomLeftXRadius / safeDeltaWidth}px ${firstState.borderBottomLeftYRadius / safeDeltaHeight}px`,
      borderBottomRightRadius: `${firstState.borderBottomRightXRadius / safeDeltaWidth}px ${firstState.borderBottomRightYRadius / safeDeltaHeight}px`,
    };
    if (animationProps.properties) {
      const properties = Array.isArray(animationProps.properties)
        ? animationProps.properties
        : [animationProps.properties];

      properties.forEach((property) => {
        const value = firstState.additionalProperties?.[property];

        if (value) startKeyframe[property as string] = value as string;
        else console.warn(`Property "${property}" is not found in the first state`);
      });
    }

    const childElement = child();
    if (!childElement) return null;

    animation = childElement.animate(
      [{ transformOrigin: '50% 50%', ...startKeyframe }, {}],
      {
        duration: animationProps.duration,
        easing: animationProps.easing,
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
    const parentElement = childElement.parentElement;

    queueMicrotask(() => {
      runWithOwner(owner, () => {
        if (exitClassName && parentElement) {
          const childElement = child();
          if (!childElement) return;

          childElement.classList.add(exitClassName);
          parentElement.append(childElement);
          const lastState = captureState(childElement, properties());
          animate(newState, lastState)?.addEventListener('finish', () => {
            childElement.remove();
          });
        }
      });
    });

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
