import React from 'react';
import ReactDOMServer from 'react-dom/server';

import App from './app';

export const render = () => {
    return ReactDOMServer.renderToString(<App />);
};
