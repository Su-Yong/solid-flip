/* @refresh reload */
import { render } from 'solid-js/web';

import { App } from './App';

import './index.css';
import { FlipProvider } from '../../../';

const root = document.getElementById('root');

render(() => (
  <FlipProvider>
    <App/>
  </FlipProvider>
), root!);
