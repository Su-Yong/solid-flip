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

  children: JSX.Element;
}

export const Flip = (props: FlipProps) => {
  const context = useContext(FlipContext);
  const nested = useContext(NestedFlipContext);

  if (!context) {
    console.warn('Flip must be used inside a FlipProvider');
    return props.children;
  }

  const { attachedFlipIds, getFirstState, setFirstState, setLastState, recordFirstState, detach, attach } = context;

  const [
    animationProps,
    timingProps,
    triggerProps,
    local,
  ] = splitProps(
    mergeProps({
      duration: 300,
      easing: 'ease-in-out',
      with: [],
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

  const animate = (firstState: DOMState, lastState: DOMState) => {
    if (!(result instanceof Element)) {
      console.warn('Flip children must be a single DOM node');
      return;
    }

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
      transformOrigin: '50% 50%',
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

    animation = result.animate(
      [startKeyframe, {}],
      {
        duration: animationProps.duration,
        easing: animationProps.easing,
      },
    );
    const animateUnflips = unflips().map((unflip, index) => {
      const firstUnflipState = unflipStates[index];
      const x = firstUnflipState.rect.left - lastState.rect.left;
      const y = firstUnflipState.rect.top - lastState.rect.top;

      return () => {
        const target = unflip as HTMLElement;
        const [parentScaleX, parentScaleY] = getComputedStyle(result as Element).scale.split(' ').map(Number);

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

    return animation;
  };

  let result: JSX.Element | null = null;
  let animation: Animation | null = null;
  const flip = () => {
    if (!(result instanceof Element)) {
      console.warn('Flip children must be a single DOM node', result);
      return;
    }

    const enterClassName = enterClass();
    let firstState = getFirstState(local.id);
    if (!firstState && enterClassName) {
      result.classList.add(enterClassName);
      firstState = captureState(result, properties());
      result.classList.remove(enterClassName);

      setFirstState(local.id, firstState);
    }

    if (firstState) {
      animation?.cancel();
      animation = null;
      const lastState = captureState(result, properties());
      setLastState(local.id, lastState);

      requestAnimationFrame(() => {
        animate(firstState, lastState);
      });
    } else {
      recordFirstState(local.id, result, properties());
    }
  };

  onMount(() => {
    if (!(result instanceof Element)) {
      console.warn('Flip children must be a single DOM node');
      return;
    }

    if (isDev) {
      if (result instanceof HTMLElement || result instanceof SVGElement) {
        result.dataset.flipId = local.id;
      }
    }

    if (!result.parentElement) return;
    flip();
  });

  createComputed(on(triggerWith, () => {
    if (!(result instanceof Element)) {
      console.warn('Flip children must be a single DOM node');
      return;
    }

    recordFirstState(local.id, result, properties());
  }, { defer: true }));

  createRenderEffect(on(() => local.id, () => {
    attach(local.id);
  }));

  createEffect(on(triggerWith, () => {
    flip();
  }, { defer: true }));

  onCleanup(() => {
    if (!(result instanceof Element)) {
      console.warn('Flip children must be a single DOM node');
      return;
    }

    detach(local.id);
    const newState = captureState(result, properties());
    setFirstState(local.id, newState);

    const owner = getOwner();
    const exitClassName = exitClass();
    const id = local.id;
    const parentElement = result.parentElement;

    queueMicrotask(() => {
      runWithOwner(owner, () => {
        if (exitClassName && parentElement) {
          if (!(result instanceof HTMLElement) && !(result instanceof SVGElement)) return;

          result.classList.add(exitClassName);
          parentElement.append(result);
          const lastState = captureState(result, properties());
          animate(newState, lastState)?.addEventListener('finish', () => {
            (result as Element).remove();
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
