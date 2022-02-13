import { createElement } from 'react';
import { render } from 'react-dom';
import { Router } from './components/Router';

render(createElement(Router), document.getElementById('app'));
