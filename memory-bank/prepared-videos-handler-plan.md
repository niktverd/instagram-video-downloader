# Подробный план: перенос и оформление handler для prepared-videos по controller-create-instruction.md

## Важно: когда и зачем использовать ApiFunctionPrototype

- **ApiFunctionPrototype** применяется для всех функций, которые реализуют бизнес-логику для API-эндпоинтов (CRUD, статистика и т.д.) и вызываются из контроллеров через wrapper.
- Используй ApiFunctionPrototype, если функция:
  - Принимает параметры запроса (Params) и объект базы (db/knex, если нужно)
  - Возвращает результат для API (Response)
  - Используется как обработчик в контроллере (через wrapper)
- Пример:

```ts
export const hasPreparedVideoBeenCreated: ApiFunctionPrototype<
  HasPreparedVideoBeenCreatedParams,
  HasPreparedVideoBeenCreatedResponse
> = async (params, db) => {
  // ...
};
```

- **Не применяй** для чистых утилит, хелперов, функций, не связанных с API-слоем (например, saveFileToDisk, uploadFileToServer, prepareText и т.д.)
- **Зачем:**
  - Гарантирует единый контракт для всех API-функций
  - Упрощает типизацию, автодополнение, тестирование
  - Позволяет легко использовать wrapper и централизованную обработку ошибок/валидации
- **Вывод:** Если функция — это "сердце" API-операции (CRUD/statistics/логика для handler), всегда используй ApiFunctionPrototype. Если это просто утилита — не надо.

## 1. Анализируем, что делает исходный код

- В файле `src/sections/shared/prepared-videos.ts` есть функции:
  - `addPreparedVideo` — добавляет видео в Firestore
  - `uploadFileToServer` — загружает файл в Firebase Storage и возвращает ссылку
  - `hasPreparedVideoBeenCreated` — проверяет, существует ли видео по accountId, scenarioId, sourceId
- **Только для `hasPreparedVideoBeenCreated` нужен API handler!**
- Остальные функции (`addPreparedVideo`, `uploadFileToServer`) должны быть перемещены в utils (например, `src/utils/preparedVideo.ts`) и не становиться публичными API endpoints.

## 2. Определяем endpoint

- Для `hasPreparedVideoBeenCreated`:
  - GET `/has-prepared-video-been-created` — проверить существование видео

## 3. Описываем схему параметров и тип ответа

- В `src/schemas/handlers/preparedVideo.ts`:
  - Zod-схема для параметров запроса (например, `HasPreparedVideoBeenCreatedParamsSchema`)
  - Zod-схема/тип для ответа (например, `HasPreparedVideoBeenCreatedResponseSchema`)
- В `src/types/preparedVideo.ts`:
  - Типы Params и Response через `z.infer<typeof ...Schema>`

## 4. Переносим бизнес-логику

- Функцию `hasPreparedVideoBeenCreated` вынести/скопировать в `src/db/preparedVideo.ts` (или оставить в db, если уже там)
- **Обязательно реализовать функцию через `ApiFunctionPrototype<Params, Response>`!** (см. раздел выше)
- Убедиться, что функция не зависит от Express/Request/Response
- Экспортировать из `src/db/index.ts`
- Функции `addPreparedVideo` и `uploadFileToServer` переместить в `src/utils/preparedVideo.ts` (или аналогичный utils-файл), сделать их чисто утилитарными, не экспортировать из db/index.ts

## 5. Импортируем всё нужное в контроллер

- В `src/sections/ui/controllers/prepared-videos.controller.ts`:
  - Импортировать функцию `hasPreparedVideoBeenCreated` из db
  - Импортировать схему параметров
  - Импортировать типы Params/Response
  - Импортировать wrapper

## 6. Создаём handler через wrapper

```ts
export const hasPreparedVideoBeenCreatedGet = wrapper<
  HasPreparedVideoBeenCreatedParams,
  HasPreparedVideoBeenCreatedResponse
>(hasPreparedVideoBeenCreated, HasPreparedVideoBeenCreatedParamsSchema, 'GET');
```

## 7. Экспортируем handler

- Экспортировать handler из файла
- Добавить экспорт в `src/sections/ui/controllers/index.ts`:
  - `export * from './prepared-videos.controller';`

## 8. Добавляем роут

- В `src/sections/ui/routes.ts`:
  - Импортировать handler
  - Добавить маршрут:
    - `router.get('/has-prepared-video-been-created', hasPreparedVideoBeenCreatedGet)`

## 9. Проверяем интеграцию

- Проверить, что endpoint работает (через Postman/curl)
- Проверить edge-кейсы (невалидные параметры, пустые значения, несуществующие id)

## 10. Пишем тесты

- В `testApi/prepared-videos.controller.test.ts`:
  - Добавить тест для handler
  - Создать тестовые данные и зависимости (account, scenario, source)
  - Проверить корректность результата

## 11. Проверяем кодстайл и типы

- Проверить, что нет ошибок линтера и TypeScript
- Импорты отсортированы, экспорты чистые
- Типы не дублируются

## 12. Финальный чеклист

- Всё экспортируется из index.ts
- Все типы через z.infer
- В тестах есть все зависимости
- Нет дублирования типов
- Нет ошибок линтера

---

> Следуй этому плану — и перенос handler будет идеальным, без багов и доработок!
