# Solid-flip
> The most advanced Flip animation library for Solid.js inspired by react-flip-toolkit

# Feature
- 🚀 Fully typed with TypeScript
- 🫙 Zero dependency
- ✅ Support Solid.js
- ✅ Support nested flip
- 📦 Support scale animation without children

## Roadmap
- [X] add `enter`, `exit` properties in `Flip`
- [ ] add `onEnter`, `onExit` properties in `Flip`
- [ ] spring-based animation config
- [ ] physics-based animation config

# Installation
```bash
pnpm add solid-flip
```
or with npm
```bash
npm install solid-flip
```

# Quick Start
1. Wrap your root component with `FlipProvider`
    ```tsx
    import { FlipProvider } from 'solid-flip';
    
    const root = document.getElementById('root');
    
    render(() => (
      <FlipProvider> // Like this
        <App/>
      </FlipProvider>
    ), root!);
    ```
2. Use `Flip` component to wrap your animated component
    ```tsx
    import { Flip } from 'solid-flip';
   
    <Flip id={'my-flip-id'}> // `id` property need to be unique
      <div class={'show'}>Animated content</div>
    </Flip>
    ```
3. Change the content of `Flip` component
    ```tsx
    import { Flip } from 'solid-flip';
   
    const [show, setShow] = createSignal(false);
   
    <Show
      when={show()}
      fallback={
        <Flip id={'my-flip-id'}>
          <div class={'hidden'}>Animated content</div>
        </Flip>
      }
    >
      <Flip id={'my-flip-id'}>
        <div class={'show'}>Animated content</div>
      </Flip>
    </Show>
   ```
    or
    ```tsx
    import { Flip } from 'solid-flip';
   
    const [show, setShow] = createSignal(false);
   
    <Flip id={'my-flip-id'} with={show()}> // set `with` property that will be used to determine when the content should be animated
      <div class={show() ? 'show' : 'hidden'}>Animated content</div>
    </Flip>
    ```
End! You have successfully added flip animation to your component!

# Example
Please check the [example](./example) folder or [codesandbox](https://codesandbox.io/p/devbox/solid-flip-example-jxqn29?embed=1&file=%2Fsrc%2FApp.tsx) for more details.

## Flip

<video width="100%" height="auto" src="https://github.com/user-attachments/assets/69367673-8edc-4c7d-816c-59a15743b05d"></video>

```tsx
<Flip id={'flip2'} with={flip2()}>
  <div class={flip2() ? 'card blue fullscreen' : 'card red'} onClick={() => setFlip2(!flip2())}>
    <Unflip>
      <div>
        {flip2() ? 'Click Again!' : 'Click!'}
      </div>
    </Unflip>
  </div>
</Flip>
```

## Flip + For

<video width="100%" height="auto" src="https://github.com/user-attachments/assets/a6b4f260-f76a-4ce6-b5a9-448697607a3b"></video>

```tsx
<div class={'grid'}>
  <For each={flip5()}>
    {(item) => (
      <Flip id={`flip5-${item}`} with={flip5()}>
        <div class={'card'}>
          {item}
        </div>
      </Flip>
    )}
  </For>
</div>
```

## Nested Flip

<video width="100%" height="auto" src="https://github.com/user-attachments/assets/0547a512-7032-4cce-940f-512de78538ef"></video>

```tsx
<div class={'grid'}>
  <For each={flip6()}>
    {(item) => (
      <Flip id={`flip6-group-${item.id}`} with={flip6()}>
        <div class={'card grid'}>
          <For each={item.items}>
            {(subItem) => (
              <Flip id={`flip6-${subItem}`} with={flip6()}>
                <div class={'card'}>
                  {subItem}
                </div>
              </Flip>
            )}
          </For>
        </div>
      </Flip>
    )}
  </For>
</div>
```

# API
## FlipProvider
`FlipProvider` component is used to wrap the root component of your application. It provides the context for the flip animation.
If you don't wrap your root component with `FlipProvider`, the flip animation will not work.

| Property      | Type         | Default | Description                                                                                                       |
|---------------|--------------|---------|-------------------------------------------------------------------------------------------------------------------|
| defaultConfig | `FlipConfig` | -       | The default configuration of the flip animation. If you set the value in `Flip` component, it will be overridden. |

```tsx
interface FlipConfig {
  duration?: number;
  easing?: string;
  enter?: string | boolean;
  exit?: string | boolean;
  preserve?: false | 'position' | 'scale' | 'all';
}
```
See `Flip` component for more details.

- Usage Example
   ```tsx
   import { FlipProvider } from 'solid-flip';
   
   const root = document.getElementById('root');
   
   render(() => (
     <FlipProvider>
       <App/>
     </FlipProvider>
   ), root!);
   ```


## Flip
`Flip` component is used to wrap the content that you want to animate. It directly passes children.

| Property   | Type                                      | Default      | Description                                                                                                                                                                                                                                                                                                                                                                                               |
|------------|-------------------------------------------|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id*        | `string`                                  | _(required)_ | The unique id of the flip component                                                                                                                                                                                                                                                                                                                                                                       |
| enabled    | `boolean`                                 | true         | Whether animation will show or not                                                                                                                                                                                                                                                                                                                                                                        |
| with       | `unknown \| unknown[]`                    | []           | The condition to determine when the content should be animated                                                                                                                                                                                                                                                                                                                                            |
| duration   | `number`                                  | 300          | The duration of the animation                                                                                                                                                                                                                                                                                                                                                                             |
| easing     | `string`                                  | 'ease'       | The easing of the animation                                                                                                                                                                                                                                                                                                                                                                               |
| properties | `string \| string[]`                      | []           | The additional properties that will be animated                                                                                                                                                                                                                                                                                                                                                           |
| enter      | `string \| boolean`                       | false        | If this value is truthy, The element will be animate when the element is inserted. The value means the initial class name of the element. If you set this value as `true`, entering class name will be set as `enter`                                                                                                                                                                                     |
| exit       | `string \| boolean`                       | false        | If this value is truthy, The element will be animate when the element is removed. The value means the class name of the element after element removed. If you set this value as `true`, exiting class name will be set as `exit`                                                                                                                                                                          |
| preserve   | `false \| 'position' \| 'scale' \| 'all'` | false        | This value manipulates the element's style when the element runs in 'enter' or 'exit'. If you set this value as `position`, the element will be use the value when the element is connected to DOM. So that It prevent the element moving to 'enter' or 'exit' position. It will be useful when you set the 'exit' animation's position as absolute or fixed. 'scale' and 'all' also act like 'position'. |

- Usage Example
  ```tsx
  import { Flip } from 'solid-flip';
  
  <Flip id={'my-flip-id'} with={flip()}>
    <div class={flip() ? 'show' : 'hidden'}>Animated content</div>
  </Flip>
    ```

## Unflip
`Unflip` component is used to warp the content that ignore parent flip animation. It directly passes children.

| Property | Type     | Default | Description                            |
|----------|----------|---------|----------------------------------------|
| id       | `string` | -       | A parent id that ignore flip animation |

- Usage Example
  ```tsx
  import { Unflip } from 'solid-flip';
  
  <Flip id={'my-flip-id'}>
    <div>
      Animated content
      <Unflip> // id is not required. Unflip component will find the parent flip component automatically.
        <div>Ignore flip animation</div>
      </Unflip>
    </div>
  </Flip>
  ```
