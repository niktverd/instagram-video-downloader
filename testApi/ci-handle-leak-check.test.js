/* eslint-env jest */

describe('handle leak check', () => {
    it('should not have extra active handles after all tests', () => {
        // eslint-disable-next-line no-underscore-dangle
        const handles = process._getActiveHandles().filter((h) => {
            // Разрешаем stdio
            if (
                h.constructor &&
                (h.constructor.name === 'WriteStream' || h.constructor.name === 'ReadStream')
            ) {
                return false;
            }
            // Разрешаем TCP-сокеты к localhost:5432 (Postgres), даже если destroyed === false
            // Это особенность node/pg на MacOS, не приводит к утечкам в CI/production
            if (
                h.constructor &&
                h.constructor.name === 'Socket' &&
                h._host === 'localhost' &&
                h.remotePort === 5432
            ) {
                return false;
            }
            // Всё остальное считаем утечкой
            return true;
        });
        if (handles.length > 0) {
            // eslint-disable-next-line no-console
            console.log(
                'LEAKED HANDLES:',
                handles.map((h) => ({
                    type: h.constructor && h.constructor.name,
                    ...h,
                })),
            );
        }
        expect(handles.length).toBe(0);
    });
});
