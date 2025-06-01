# Инструкция: Как создать контроллер (handler) для API (чеклист для детей и взрослых)

## 1. Определи, что должен делать твой handler

- Какую операцию он выполняет? (создать, получить, обновить, удалить, статистика и т.д.)
- Какие параметры нужны на вход? (id, slug, фильтры, массив дат и т.д.)
- Какой результат должен вернуть? (объект, массив, число, статус)

## 2. Определи схему параметров и тип ответа

- В `src/schemas/handlers/{entity}.ts` определи Zod-схему для параметров запроса (например, `id: z.string()`)
- Определи схему/тип для ответа (например, объект, массив, число)
- Экспортируй эти схемы (через `export const ...Schema`)

## 3. Определи типы Params и Response

- В `src/types/{entity}.ts` (или sharedTypes/types/{entity}.ts, если используется) определи типы Params и Response через `z.infer<typeof ...Schema>`
- Экспортируй их
- **Не дублируй типы в других слоях! Импортируй их из types.**

## 4. Реализуй функцию в слое db (или components)

- В `src/db/{entity}.ts` (или components) создай функцию, реализующую бизнес-логику (например, `getAccountById`)
- Принимай параметры и объект db (если нужно)
- Возвращай результат в формате `{ result, code }` (или `{ result: ..., code: ... }`)
- Экспортируй функцию из db/index.ts

## 5. Импортируй всё нужное в контроллер

- В `src/sections/ui/controllers/{entity}.controller.ts` импортируй:
  - функцию из db (или components)
  - схему параметров
  - типы Params и Response (только из types!)
  - wrapper (обычно из db/utils или db)

## 6. Создай handler через wrapper

- Используй wrapper для создания handler:

```ts
export const getEntityByIdGet = wrapper<GetEntityByIdParams, GetEntityByIdResponse>(
  getEntityById,
  GetEntityByIdParamsSchema,
  'GET',
);
```

- Название: {operation}{Entity}{Method} (например, getAccountByIdGet, createUserPost)

## 7. Экспортируй handler

- Экспортируй handler из файла (export const ...)
- Добавь экспорт в `src/sections/ui/controllers/index.ts` (export \* from './accounts.controller')

## 8. Добавь роут

- В `src/sections/ui/routes.ts` импортируй handler
- Добавь маршрут (router.get/post/patch/delete(...))
- Пример: `router.get('/get-account-by-id', getAccountByIdGet)`
- **Если нужно поддерживать оба метода (GET и POST) для одного handler — добавь оба роута!**

## 9. Проверь интеграцию

- Проверь, что endpoint работает (через Postman, curl, браузер)
- Проверь edge-кейсы (невалидные параметры, пустые значения)
- **Проверь, что результат возвращается строго через поле `.result` (или как требует контракт)**

## 10. Напиши тесты

- В `testApi/{entity}.controller.test.ts` добавь тесты для handler
- Создай тестовые данные и зависимости (user, account и т.д.)
- Проверь, что handler возвращает правильный результат для существующих и несуществующих данных

## 11. Проверь кодстайл и типы

- Убедись, что нет ошибок линтера и TypeScript
- Импорты отсортированы, экспорты чистые
- Не смешивай типы из src/types и sharedTypes/types
- **Не дублируй типы в db — только импортируй!**

## 12. Проверь чеклист типичных ошибок

- Всё экспортируется из index.ts
- Все типы через z.infer
- В тестах есть все зависимости
- Нет дублирования типов
- Нет ошибок линтера
- **POST-роуты добавлены, если нужны**
- **Возврат результата строго через .result**

---

## Минимальный шаблон для копипасты

```ts
// controller
export const getEntityByIdGet = wrapper<GetEntityByIdParams, GetEntityByIdResponse>(
  getEntityById,
  GetEntityByIdParamsSchema,
  'GET',
);
// если нужен POST-роут:
export const getEntityByIdPost = wrapper<GetEntityByIdParams, GetEntityByIdResponse>(
  getEntityById,
  GetEntityByIdParamsSchema,
  'POST',
);
```

---

> Следуй этим шагам — и твой handler будет работать с первого раза, без багов и доработок!  
> Не забывай: не дублируй типы, всегда импортируй их из types, и добавляй оба роута (GET/POST), если это нужно клиенту.
