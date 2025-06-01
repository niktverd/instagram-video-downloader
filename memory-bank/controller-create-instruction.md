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

## Как правильно оформлять модель (model) для Entity

1. **Zod-схема** — лежит в `src/schemas/models/{entity}.ts`, описывает shape и валидацию.
2. **Интерфейс** — в `src/types/{entity}.ts`, всегда через `z.infer<typeof ...Schema>`, например:
   ```ts
   export type IAccount = z.infer<typeof AccountSchema>;
   ```
3. **Модель** — в `src/models/{Entity}.ts`, наследует BaseModel, implements интерфейс, описывает tableName, idColumn, relationMappings.
   ```ts
   export class Account extends BaseModel implements IAccount { ... }
   ```
4. **Типы полей** — должны быть синхронизированы между схемой, интерфейсом и моделью (например, даты — либо string, либо Date, enum — либо string, либо enum, но единообразно).
5. **relationMappings** — всегда добавляй, даже если пока пустой (для единообразия и расширяемости).
6. **tableName/idColumn** — всегда через статические геттеры.
7. **Рекомендация:**
   - Если используешь enum — тип поля в модели должен быть enum, а не string.
   - Если используешь даты — выбери единый стиль (string или Date) и придерживайся его во всех слоях.
   - Не дублируй поля руками, всё через схему и типизацию.

---

## Как привести любую схему к единому стилю с остальными моделями

1. **Используй createEntitySchema**
   - Импортируй и используй createEntitySchema вместо прямого z.object для всех моделей.
   - Это обеспечит автодобавление стандартных полей (id, createdAt, updatedAt), если они нужны.
2. **Добавь .strict()**
   - Заверши схему .strict() для запрета лишних полей.
3. **Приведи id к единому виду**
   - Если id всегда есть в БД — не делай его опциональным.
   - Если id добавляется через createEntitySchema — не дублируй его в объекте.
4. **Приведи типы дат к единому виду**
   - Если во всех схемах даты — string, оставь string.
   - Если везде Date — используй z.date().
   - Если даты добавляются через base — не дублируй их.
5. **Проверь, нужны ли базовые поля**
   - Если в других схемах есть createdAt, updatedAt, добавь их через base или явно.
6. **Проверь, нужны ли дополнительные поля**
   - Если есть специфичные для этой сущности поля — оставь их в объекте.
7. **Проверь, что интерфейс строится через z.infer<typeof Schema>**
8. **Проверь, что модель реализует интерфейс и наследует BaseModel**
9. **Проверь, что все импорты и типы везде обновлены**
10. **Протестируй**: создание, обновление, валидация, сериализация/десериализация, чтобы убедиться, что всё работает как и для других моделей.

**Резюме:**

- Используй createEntitySchema + .strict()
- Не дублируй id, createdAt, updatedAt, если они уже в base
- Приводи типы дат и enum к единому виду
- Интерфейс только через z.infer<typeof Schema>
- Модель всегда implements интерфейс и наследует BaseModel

---

## Рекомендации по Response-типам (единый стиль)

- Не используй лишнюю обёртку result в типах Response. Тип ответа должен быть просто сущность (IEntity) или массив сущностей, либо null, если не найдено.
- Пример:
  ```ts
  export type CreateAccountResponse = IAccount;
  export type GetAccountByIdResponse = IAccount | null;
  export type GetAllAccountsResponse = IAccount[];
  ```
- Для cloudRunScenarioExecution и любых новых моделей:
  - Используй тот же паттерн: тип ответа — это ICloudRunScenarioExecution | null (или массив, если нужно).
  - Не делай Response вида `{ result: IEntity | null, code: number }` — это приводит к лишней вложенности и ошибкам типов.
- Все функции и контроллеры должны возвращать result: IEntity, а не result: { result: IEntity }.
- Это упрощает типизацию, автодополнение, тесты и интеграцию с фронтом.

---

## Практические советы и best practices сверх инструкции

### 1. Устраняй дублирующие контроллеры

- Если в проекте есть несколько файлов-контроллеров для одной сущности (например, `cloudRunScenarioExecution.controller.ts` и `cloud-run-scenario-executions.controller.ts`), оставляй только один, соответствующий принятому стилю.
- Проверь, чтобы все импорты, экспорты и роуты ссылались только на этот файл.
- Удаляй дублирующие файлы, чтобы не было путаницы и конфликтов.

### 2. Приводи тесты к единому стилю

- Все тесты должны использовать общий подход: через `testApp` (экземпляр express/supertest), а не через fetch/localhost.
- Проверяй экспорт и типы хендлеров (expect(controller).toHaveProperty(...)).
- Используй хелперы для создания/удаления/обновления сущностей, чтобы избежать дублирования кода.
- Тестируй CRUD-операции, edge-кейсы, структуру и типы данных.
- Не забывай про изоляцию тестовой среды (очистка БД, фикстуры).

### 3. Поддерживай чистоту структуры

- Следи, чтобы не было дублирующих файлов, битых импортов, неиспользуемых роутов.
- Все экспорты должны идти через единый index.ts.
- Роуты должны быть чистыми, без дублирующих/устаревших путей.

### 4. Рекомендации по стилю

- Используй единый стиль именования файлов (kebab-case или camelCase — выбери и придерживайся).
- Все контроллеры и тесты должны быть оформлены одинаково для удобства поддержки.

### 5. Если меняешь структуру — проверь всё по чеклисту

- После любых изменений (удаление файлов, переименование, рефакторинг) обязательно проверь:
  - Все импорты/экспорты актуальны
  - Все роуты рабочие
  - Все тесты проходят
  - Нет дублирующих или устаревших файлов

---

## Единый стиль тестирования: использование утилит (хелперов) из testApi/utils

### Почему это важно

- Все тесты контроллеров должны использовать утилиты/хелперы из `testApi/utils` (например, `accounts.ts`, `scenarios.ts`, и т.д.), чтобы:
  - Избежать дублирования кода (DRY)
  - Гарантировать чистоту и изоляцию тестовых данных
  - Упростить поддержку и расширение тестов
  - Использовать единый подход к работе с supertest/app
- Тесты, которые не используют эти утилиты, становятся менее поддерживаемыми, более хрупкими и сложными для рефакторинга.

### Как правильно писать тесты контроллеров (пошагово)

1. **Создай утилиту для сущности**

   - В папке `testApi/utils` создай файл с именем сущности, например, `cloudRunScenarioExecutions.ts`.
   - Вынеси туда функции-хелперы для создания, получения, обновления, удаления сущности через supertest:

     ```ts
     // testApi/utils/cloudRunScenarioExecutions.ts
     import request from 'supertest';
     import testApp from '../../app';

     export async function createCloudRunScenarioExecutionHelper(payload) {
       return request(testApp).post('/api/ui/cloud-run-scenario-execution').send(payload);
     }
     // Аналогично для get, patch, delete
     ```

2. **Используй эти хелперы в тестах**

   - В тесте импортируй нужные функции:
     ```ts
     import {
       createCloudRunScenarioExecutionHelper,
       getCloudRunScenarioExecutionHelper,
       updateCloudRunScenarioExecutionHelper,
     } from './utils/cloudRunScenarioExecutions';
     ```
   - Пиши тесты лаконично, вызывая хелперы, а не дублируя CRUD-логику:
     ```ts
     it('create & get', async () => {
       const resCreate = await createCloudRunScenarioExecutionHelper(payload);
       expect(resCreate.status).toBeLessThan(300);
       const resGet = await getCloudRunScenarioExecutionHelper({messageId, attempt});
       expect(resGet.body.messageId).toBe(messageId);
     });
     ```

3. **Убедись, что testApp — это supertest(app)**

   - testApp должен быть обёрткой над express через supertest, чтобы работали методы `.send`, `.get`, `.post` и т.д.
   - Пример:
     ```ts
     import app from '../app';
     import request from 'supertest';
     const testApp = request(app);
     ```

4. **Проверь, что все тесты используют утилиты**

   - Нет ручных fetch/localhost-запросов, нет дублирования CRUD прямо в тестах.
   - Все тесты используют хелперы из `testApi/utils`.

5. **Преимущества**
   - Легко менять API: меняешь только хелпер, а не все тесты.
   - Быстро писать новые тесты.
   - Единый стиль во всём проекте.

---

> Следуй этому подходу — и твои тесты будут такими же чистыми, как и твой код!
