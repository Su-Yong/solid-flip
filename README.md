# solid-flip
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
   
    <Flip id={'my-flip-id'} with={show()}> // set `with` property that will be used to determine whether the content should be animated
      <div class={show() ? 'show' : 'hidden'}>Animated content</div>
    </Flip>
    ```
End! You have successfully added flip animation to your component!

# Example
Please check the [example](./example) folder or ~~codesandbox for more details.~~ (TODO)

# Usage
## Flip
> TODO

## Unflip
> TODO
