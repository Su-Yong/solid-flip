# Solid-flip
> The most advanced Flip animation library for Solid.js inspired by react-flip-toolkit

# Feature
- 🚀 Fully typed with TypeScript
- 🫙 Zero dependency
- ✅ Support Solid.js
- ✅ Support nested flip
- 📦 Support scale animation without children

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
Please check the [example](./example) folder or [codesandbox](https://codesandbox.io/p/devbox/solid-flip-example-jxqn29?layout=%257B%2522sidebarPanel%2522%253A%2522EXPLORER%2522%252C%2522rootPanelGroup%2522%253A%257B%2522direction%2522%253A%2522horizontal%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522id%2522%253A%2522ROOT_LAYOUT%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522cm09d7dxu0007356kxh6f5xqf%2522%252C%2522sizes%2522%253A%255B70%252C30%255D%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522EDITOR%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522id%2522%253A%2522cm09d7dxu0002356kevfz4n51%2522%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522SHELLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522id%2522%253A%2522cm09d7dxu0004356kbtv0guap%2522%257D%255D%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522DEVTOOLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522id%2522%253A%2522cm09d7dxu0006356kcur5ddfr%2522%257D%255D%257D%255D%252C%2522sizes%2522%253A%255B50%252C50%255D%257D%252C%2522tabbedPanels%2522%253A%257B%2522cm09d7dxu0002356kevfz4n51%2522%253A%257B%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522cm09d7dxu0001356k4yeu6f2b%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522FILE%2522%252C%2522filepath%2522%253A%2522%252FREADME.md%2522%257D%255D%252C%2522id%2522%253A%2522cm09d7dxu0002356kevfz4n51%2522%252C%2522activeTabId%2522%253A%2522cm09d7dxu0001356k4yeu6f2b%2522%257D%252C%2522cm09d7dxu0006356kcur5ddfr%2522%253A%257B%2522id%2522%253A%2522cm09d7dxu0006356kcur5ddfr%2522%252C%2522activeTabId%2522%253A%2522cm09dnbc8005q356k53jybssr%2522%252C%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522cm09d7dxu0005356kg9o6m2uw%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522TASK_PORT%2522%252C%2522taskId%2522%253A%2522dev%2522%252C%2522port%2522%253A5173%257D%252C%257B%2522type%2522%253A%2522UNASSIGNED_PORT%2522%252C%2522port%2522%253A5173%252C%2522id%2522%253A%2522cm09dnbc8005q356k53jybssr%2522%252C%2522mode%2522%253A%2522permanent%2522%257D%255D%257D%252C%2522cm09d7dxu0004356kbtv0guap%2522%253A%257B%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522cm09d7dxu0003356kvj5w6lba%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522TASK_LOG%2522%252C%2522taskId%2522%253A%2522dev%2522%257D%255D%252C%2522id%2522%253A%2522cm09d7dxu0004356kbtv0guap%2522%252C%2522activeTabId%2522%253A%2522cm09d7dxu0003356kvj5w6lba%2522%257D%257D%252C%2522showDevtools%2522%253Atrue%252C%2522showShells%2522%253Atrue%252C%2522showSidebar%2522%253Atrue%252C%2522sidebarPanelSize%2522%253A15%257D) for more details.

## Flip

https://github.com/user-attachments/assets/69367673-8edc-4c7d-816c-59a15743b05d

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

https://github.com/user-attachments/assets/a6b4f260-f76a-4ce6-b5a9-448697607a3b

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

https://github.com/user-attachments/assets/0547a512-7032-4cce-940f-512de78538ef

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

## Flip
`Flip` component is used to wrap the content that you want to animate. It directly passes children.

| Property   | Type                   | Default      | Description                                                    |
|------------|------------------------|--------------|----------------------------------------------------------------|
| id         | `string`               | _(required)_ | The unique id of the flip component                            |
| with       | `unknown \| unknown[]` | []           | The condition to determine when the content should be animated |
| duration   | `number`               | 300          | The duration of the animation                                  |
| easing     | `string`               | 'ease'       | The easing of the animation                                    |
| properties | `string \| string[]`   | []           | The additional properties that will be animated                |

## Unflip
`Unflip` component is used to warp the content that ignore parent flip animation. It directly passes children.

| Property | Type     | Default | Description                            |
|----------|----------|---------|----------------------------------------|
| id       | `string` | -       | A parent id that ignore flip animation |
