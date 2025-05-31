# Инструкция: Как добавить раздел со статистикой для сущности (идеальный чеклист)

## 1. Определи бизнес-логику статистики

- Что именно нужно считать? (например, количество созданных записей по дням)
- Какие параметры нужны на вход? (например, массив дат, диапазон, фильтры)
- Какой формат ответа ожидается?

## 2. Добавь схему параметров запроса и тип ответа

- В `src/schemas/handlers/{entity}.ts` определи Zod-схему для параметров (например, days: z.array(z.string()))
- Определи тип для ответа (например, Record<string, number>)
- Экспортируй эти сущности (export const ...Schema, export type ...Response)
- Используй z.infer для Params/Response, если есть схема

## 3. Добавь типы в sharedTypes/types/{entity}.ts (единственный источник правды для типов)

- Импортируй схему параметров
- Добавь типы Params и Response для статистики через z.infer<typeof ...Schema>
- Экспортируй их
- Не дублируй типы в src/types!

## 4. Реализуй функцию в слое db

- В `src/db/{entity}.ts` создай функцию get{Entity}StatisticsByDays
- Принимай params: { days: string[] }, db
- Используй query с group by/aggregation для подсчёта
- Возвращай { result, code: 200 }
- Экспортируй функцию из db/index.ts

## 5. Добавь контроллер

- В `src/sections/ui/controllers/{entity}.controller.ts` импортируй функцию, схему и типы
- Создай handler через wrapper<Params, Response>(...)
- Экспортируй его

## 6. Добавь роут

- В `src/sections/ui/routes.ts` импортируй handler
- Добавь GET/POST роут (например, /get-{entity}-statistics-by-days)

## 7. Проверь интеграцию

- Убедись, что endpoint доступен и возвращает ожидаемый формат
- Проверь edge-кейсы (пустой массив, несуществующие даты)

## 8. Напиши тесты

- В `testApi/{entity}.controller.test.ts` добавь тест
- Создай тестовые записи с нужными датами
- Всегда создавай все зависимости (account, scenario, source и т.д.)
- Проверь, что статистика корректна для разных дней

## 9. Проверь кодстайл и типы

- Убедись, что нет ошибок линтера и TS
- Проверь сортировку импортов и чистоту экспорта
- Не смешивай типы из src/types и sharedTypes/types

---

## Минимальный пример для копипасты

### db/{entity}.ts

```ts
export const get{Entity}StatisticsByDays: ApiFunctionPrototype<
    { days: string[] },
    Record<string, number>
> = async (params, db) => {
    const {days} = params;
    if (!days.length) return {result: {}, code: 200};
    const rows = (await Model.query(db)
        .select(db.raw(`to_char("createdAt", 'YYYY-MM-DD') as day`), db.raw('count(*) as count'))
        .whereIn(db.raw(`to_char("createdAt", 'YYYY-MM-DD')`), days)
        .groupBy('day')) as unknown as Array<{day: string; count: string | number}>;
    const result: Record<string, number> = {};
    for (const row of rows) {
        result[row.day] = Number(row.count);
    }
    for (const day of days) {
        if (!(day in result)) result[day] = 0;
    }
    return {result, code: 200};
};
```

### schemas/handlers/{entity}.ts

```ts
export const {Entity}StatisticsParamsSchema = z.object({
    days: z.array(z.string()),
}).strict();
export type {Entity}StatisticsResponse = Record<string, number>;
```

### sharedTypes/types/{entity}.ts

```ts
export type {Entity}StatisticsParams = z.infer<typeof {Entity}StatisticsParamsSchema>;
export type {Entity}StatisticsResponse = Record<string, number>;
```

### controllers/{entity}.controller.ts

```ts
export const get{Entity}StatisticsByDaysGet = wrapper<
    {Entity}StatisticsParams,
    {Entity}StatisticsResponse
>(get{Entity}StatisticsByDays, {Entity}StatisticsParamsSchema, 'GET');
```

### routes.ts

```ts
router.get('/get-{entity}-statistics-by-days', get{Entity}StatisticsByDaysGet);
```

### testApi/{entity}.controller.test.ts

```ts
it('get{Entity}StatisticsByDays: returns correct stats for given days', async () => {
  // Создаём все зависимости (account, scenario, source и т.д.)
  // ...
  // Создаём 3 записи, одну переносим на вчера по createdAt
  // ...
  // Запрашиваем статистику
  // ...
  // Проверяем результат
});
```

---

## Чеклист для самопроверки

- [ ] Все типы только в sharedTypes/types/{entity}.ts
- [ ] Все новые функции экспортируются из db/index.ts
- [ ] Все схемы и типы экспортируются из schemas/handlers/{entity}.ts
- [ ] Везде используется z.infer для Params/Response
- [ ] В тестах создаются все зависимости
- [ ] Импорты отсортированы, экспорты чистые
- [ ] Нет ошибок линтера и TS
- [ ] Не смешаны типы из src/types и sharedTypes/types

---

## Типичные ошибки и как их избежать

- **Ошибка:** Не экспортировал функцию/схему/тип —> **Решение:** Проверь чеклист!
- **Ошибка:** Типы разбросаны по src/types и sharedTypes/types —> **Решение:** Используй только sharedTypes/types
- **Ошибка:** В тестах не созданы зависимости —> **Решение:** Всегда создавай account, scenario, source и т.д.
- **Ошибка:** Не совпадают типы Params/Response —> **Решение:** Используй z.infer и единый источник схемы
- **Ошибка:** Линтер ругается на импорты —> **Решение:** Сортируй импорты, не дублируй экспорты

---

> Следуй этой инструкции — и задача по статистике будет закрыта с первого раза, без багов и доработок!
