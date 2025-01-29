import {Request, Response} from 'express';

import {render} from '../react-client';

export const renderReactApp = (_: Request, res: Response) => {
    const reactApp = render(); // Рендерим React-компонент в строку
    res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React SSR</title>
        </head>
        <body>
        <div id="root">${reactApp}</div>
        <script src="/client/main.js"></script> <!-- Подключение клиентского JS -->
        </body>
        </html>
        `);
};

export const fetchMediaPostsForReactUI = (req: Request, res: Response) => {
    const {page = 1} = req.query;
    res.status(200).json([page]);
};
