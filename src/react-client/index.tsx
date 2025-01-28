// import babel from '@babel/register';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import App from './app';

// babel({
//     presets: ['@babel/preset-env', '@babel/preset-react'],
// });

export const renderApp = () => {
    return ReactDOMServer.renderToString(<App />);
};
