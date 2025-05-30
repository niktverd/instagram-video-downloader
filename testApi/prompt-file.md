# prompt-file.md

## Universal Test Generation Prompt for Controllers/Modules

**Purpose:**
Generate a comprehensive Jest test file for the specified controller or module. The only required input is the path to the file you want to test (e.g., `src/sections/ui/controllers/some-controller.ts`). The agent should infer everything else from the codebase and this prompt.

---

## Instructions

1. **File Structure:**

   - Place the test file in the `testApi/` directory.
   - Name the test file as `<original-file-name>.test.ts` (e.g., `some-controller.test.ts`).
   - Import the module under test and all necessary helpers.
   - Use `clearDbBeforeEach` or an equivalent to reset the DB/state before each test if available.

2. **Test Coverage:**

   - Check that the module exports all expected handler functions (or main exports).
   - For each handler/exported function:
     - Assert it is a function.
     - Write at least one test for its main functionality, using HTTP requests if it is an API handler, or direct calls otherwise.
   - Use helpers for setup/teardown and for making requests (see below).

3. **Helpers:**

   - If helpers exist in `testApi/utils/` or a similar directory, use them for creating, updating, deleting, and fetching entities.
   - If no helpers exist, generate minimal helpers for common CRUD operations based on the module's API or exported functions.
   - Helpers should encapsulate HTTP request logic or direct function calls, and return response objects suitable for assertions.

4. **Assertions:**

   - Always check response status and body.
   - For create/update, check the returned object and its fields.
   - For delete, ensure the entity is removed.
   - For get/list, check the count and returned data.

5. **Test Example Structure:**

```ts
import testApp from '../app';
import * as moduleUnderTest from '<path-to-module-under-test>';

import './clearDbBeforeEach';
import {
    createEntityHelper,
    deleteEntityHelper,
    getAllEntitiesHelper,
    updateEntityHelper,
} from './utils/<entity>'; // Use or generate helpers as needed

describe('<module/file name>', () => {
    it('should export all handlers', () => {
        expect(moduleUnderTest).toHaveProperty('<handler1>');
        expect(moduleUnderTest).toHaveProperty('<handler2>');
        // ...
    });

    it('handlers should be functions', () => {
        expect(typeof moduleUnderTest.<handler1>).toBe('function');
        expect(typeof moduleUnderTest.<handler2>).toBe('function');
        // ...
    });

    it('create & getAll', async () => {
        const response = await createEntityHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await getAllEntitiesHelper(testApp);
        expect(response2.body).toBeDefined();
        expect(response2.body.count).toBeDefined();
        expect(response2.body.count).not.toBe(0);
        expect(response2.status).toBeLessThan(299);
    });

    it('update', async () => {
        const response = await createEntityHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await updateEntityHelper(
            {
                id: response.body.id,
                name: 'test2',
            },
            testApp,
        );
        expect(response2.body).toBeDefined();
        expect(response2.body.name).toBe('test2');
        expect(response2.status).toBeLessThan(299);
    });

    it('delete', async () => {
        const response = await createEntityHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await deleteEntityHelper({id: response.body.id}, testApp);
        expect(response2.status).toBeLessThan(299);

        const response3 = await getAllEntitiesHelper(testApp);
        expect(response3.body).toBeDefined();
        expect(response3.body.count).toBeDefined();
        expect(response3.body.count).toBe(0);
        expect(response3.status).toBeLessThan(299);
    });
});
```

---

## About Helpers

- Helpers should be placed in `testApi/utils/<entity>.ts`.
- They must encapsulate all HTTP or direct function call logic for CRUD operations.
- If helpers are missing, generate them based on the module's API or exported functions.
- Use helpers to keep tests concise and DRY.

---

## Usage

- To generate tests for a new file, just specify the path to the file you want to test.
- The agent should:
  - Analyze the file and its exports.
  - Find or generate appropriate helpers.
  - Write a Jest test file covering all handlers/exports as described above.
  - Use the example structure and follow all requirements in this prompt.
- No further clarification should be needed unless the file is ambiguous or missing critical context.

---

## Real-World Gotchas (AI Observations)

- For DELETE requests, always use `.query()` to send parameters, not `.send()`, unless your backend explicitly parses JSON body for DELETE.
- Always annotate all helper function parameters with explicit types if using TypeScript.
- Use `.send()` for POST/PATCH, `.query()` for GET/DELETE in helpers.
- If you get a 400 error, double-check parameter placement (body vs query).
- Sort imported types alphabetically to avoid linter errors.

---

## Реальные детали и best practices (дополнение)

**1. Структура ответов API:**

- Во всех актуальных контроллерах (scenarios, sources, locations) объект или массив возвращается напрямую в `response.body`, а не под ключом `result`.
- Пример: `response.body.id`, `Array.isArray(response.body)` и т.д.

**2. Пути эндпоинтов для сценариев:**

- POST `/api/ui/add-scenario`
- GET `/api/ui/get-scenarios`
- GET `/api/ui/get-scenario-by-id`
- PATCH `/api/ui/patch-scenario`
- DELETE `/api/ui/delete-scenario`

**3. Минимальный payload для создания сценария:**

```js
{
  slug: 'test-scenario',
  type: ScenarioType.ScenarioAddBannerAtTheEndUnique,
  enabled: true,
  onlyOnce: false,
  options: {},
  instagramLocationSource: InstagramLocationSource.Scenario,
}
```

**4. Helpers:**

- Helpers должны возвращать raw supertest response. В тестах работайте с `response.body` напрямую.

**5. Пример реальной ошибки:**

- Ошибка: `TypeError: Cannot read properties of undefined (reading 'id')`
- Причина: попытка доступа к `response.body.result.id` вместо `response.body.id`.
- Решение: всегда проверяйте реальную структуру ответа через логи или curl.

**6. clearDbBeforeEach:**

- Используйте файл `clearDbBeforeEach.js` для сброса состояния БД перед каждым тестом.

---

## Real-world details and best practices (supplement, EN)

**1. API response structure:**

- In all current controllers (scenarios, sources, locations), the object or array is returned directly in `response.body`, not under a `result` key.
- Example: `response.body.id`, `Array.isArray(response.body)`, etc.

**2. Endpoint paths for scenarios:**

- POST `/api/ui/add-scenario`
- GET `/api/ui/get-scenarios`
- GET `/api/ui/get-scenario-by-id`
- PATCH `/api/ui/patch-scenario`
- DELETE `/api/ui/delete-scenario`

**3. Minimal payload for creating a scenario:**

```js
{
  slug: 'test-scenario',
  type: ScenarioType.ScenarioAddBannerAtTheEndUnique,
  enabled: true,
  onlyOnce: false,
  options: {},
  instagramLocationSource: InstagramLocationSource.Scenario,
}
```

**4. Helpers:**

- Helpers should return the raw supertest response. In tests, always work with `response.body` directly.

**5. Example of a real error:**

- Error: `TypeError: Cannot read properties of undefined (reading 'id')`
- Cause: trying to access `response.body.result.id` instead of `response.body.id`.
- Solution: always check the real response structure via logs or curl.

**6. clearDbBeforeEach:**

- Use the `clearDbBeforeEach.js` file to reset DB state before each test.

---
