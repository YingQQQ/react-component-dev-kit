import React from 'react';
import { render } from 'react-dom';

import LoadMore from './LoadMore';

const rootEl = window.document.getElementById('app');

render(<LoadMore color="yellow" />, rootEl);
