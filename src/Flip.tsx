import {
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  on,
  onCleanup,
  onMount,
  splitProps,
  useContext
} from 'solid-js';
import { isDev } from 'solid-js/web';

import { captureState } from './state';
import { FlipContext, NestedFlipContext, NestedFlipProvider } from './context';

import type { JSX } from 'solid-js/jsx-runtime';

export interface FlipProps {
  id: string;

  /* animation props */
  duration?: number;
  easing?: string;

  /* trigger */
  with?: unknown[] | unknown;

  children: JSX.Element;
}

export const Flip = (props: FlipProps) => {
  const context = useContext(FlipContext);
  const nested = useContext(NestedFlipContext);

  if (!context) {
    console.warn('Flip must be used inside a FlipProvider');
    return props.children;
  }

  const { getFirstState, setLastState, recordFirstState } = context;

  const [animationProps, triggerProps, local] = splitProps(
    mergeProps({
      duration: 300,
      easing: 'ease-in-out',
      with: [],
    }, props),
    ['duration', 'easing'],
    ['with'],
  );

  const [unflips, setUnflips] = createSignal<Element[]>([]);

  const triggerWith = createMemo(() => {
    const value = triggerProps.with;

    return Array.isArray(value) ? value : [value];
  });

  let result: JSX.Element | null = null;
  let animation: Animation | null = null;
  const flip = () => {
    if (!(result instanceof Element)) {
      console.warn('Flip children must be a single DOM node', result);
      return;
    }

    const firstState = getFirstState(local.id);
    if (firstState) {
      animation?.cancel();
      animation = null;
      const afterState = captureState(result);
      setLastState(local.id, afterState);

      requestAnimationFrame(() => {
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

        const offsetX = (firstState.rect.width - afterState.rect.width) / 2;
        const offsetY = (firstState.rect.height - afterState.rect.height) / 2;

        const deltaX = -1 * parentDeltaX + firstState.rect.left - afterState.rect.left + offsetX;
        const deltaY = -1 * parentDeltaY + firstState.rect.top - afterState.rect.top + offsetY;
        const deltaWidth = (firstState.rect.width / afterState.rect.width) / parentDeltaWidth;
        const deltaHeight = (firstState.rect.height / afterState.rect.height) / parentDeltaHeight;

        const unflipStates = unflips().map(captureState);
        animation = result.animate([
          {
            transformOrigin: '50% 50%',
            translate: `${deltaX}px ${deltaY}px`,
            scale: `${deltaWidth} ${deltaHeight}`,
            backgroundColor: firstState.color,
            opacity: firstState.opacity,
          },
          {}
        ], {
          duration: animationProps.duration,
          easing: animationProps.easing,
        });
        unflips().forEach((unflip, index) => {
          const firstUnflipState = unflipStates[index];
          const x = firstUnflipState.rect.left - afterState.rect.left;
          const y = firstUnflipState.rect.top - afterState.rect.top;

          const animate = () => {
            const target = unflip as HTMLElement;
            const [parentScaleX, parentScaleY] = getComputedStyle(result as Element).scale.split(' ').map(Number);

            if (!Number.isFinite(parentScaleX) || !Number.isFinite(parentScaleY)) {
              target.style.removeProperty('scale');
              target.style.removeProperty('translate');
              return;
            }

            const scaleX = 1 / parentScaleX;
            const scaleY = 1 / parentScaleY;
            const offsetX = firstUnflipState.rect.width * (scaleX - 1) / 2 + x * (scaleX - 1);
            const offsetY = firstUnflipState.rect.height * (scaleY - 1) / 2 + y * (scaleY - 1);

            target.style.setProperty('translate', `${offsetX}px ${offsetY}px`);
            target.style.setProperty('scale', `${scaleX} ${scaleY}`);

            requestAnimationFrame(animate);
          };
          animate();
        });

      });
    } else {
      recordFirstState(local.id, result);
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

    recordFirstState(local.id, result);
  }, { defer: true }));

  createEffect(on(triggerWith, () => {
    flip();
  }, { defer: true }));

  onCleanup(() => {
    if (!(result instanceof Element)) {
      console.warn('Flip children must be a single DOM node');
      return;
    }

    recordFirstState(local.id, result);
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
