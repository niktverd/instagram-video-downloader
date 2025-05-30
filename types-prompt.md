# Migration Prompt for Entity and Service Type Refactoring

Используй этот промпт для каждой бизнес-сущности **и** сервисного типа (например, Account, Scenario, pubsub, uiCommon и т.д.), чтобы мигрировать все типы, схемы и CRUD-логику в новую единую структуру:

---

**Prompt:**

Мигрируй сущность или сервис `{EntityOrServiceName}` в новую структуру, как описано в types.md.

- Перенеси все Zod-схемы для `{EntityOrServiceName}` из `src/schemas/models` (и связанные расширения сценариев из `src/schemas/scenario.ts`, если применимо) в новый файл: `src/entities/{entityOrServiceName}.ts`.
- Перенеси все TypeScript-типы для `{EntityOrServiceName}` из `src/types/{entityOrServiceName}.ts` в этот же файл.
- Перенеси все CRUD-схемы (параметры/ответы для API) для `{EntityOrServiceName}` из `src/schemas/handlers/{entityOrServiceName}.ts` в этот же файл.
- Для сервисных типов (pubsub, uiCommon, cloud-run, instagramInsights, publishInstagram, instagramApi, common) — перенеси все служебные типы и схемы в соответствующий файл в `src/entities`.
- Для enum'ов — перенеси все перечисления в `src/entities/enums.ts`.
- Убедись, что все импорты локальные (в пределах `src/entities` или enum'ы из `src/entities/enums.ts`).
- Удали дублирующиеся и устаревшие типы/схемы.
- Итоговый файл должен содержать:
  - Основную Zod-схему сущности/типа (если применимо)
  - Все связанные типы (например, `I{EntityName}`, CRUD-типы, служебные типы)
  - Все CRUD-схемы (например, `Create{EntityName}ParamsSchema`)
  - Все параметры/ответы для API
  - Все расширения сценариев (только для scenario.ts)
- Не включай не относящийся к делу код или типы других сущностей/сервисов.
- Используй четкие и согласованные имена для всех экспортов.
- В новых файлах схемы (Zod) всегда располагаются вверху файла, а типы — внизу.
- В конце дай краткое summary: что было перенесено, что удалено, что объединил.

---

**Пример использования:**

```
Мигрируй сущность `Account` в новую структуру, как описано в types.md. ...
```

Повтори этот процесс для каждой бизнес-сущности и сервисного типа в проекте.

---

**NB:** После переноса обязательно добавь `export * from './{entityOrServiceName}';` в `src/entities/index.ts` для корректной работы barrel-импортов.

**NB:** Перед исправлением ошибок всегда вызывай `npm run lint:fix`.

**NB:** В новых файлах схемы (Zod) всегда располагаются вверху файла, а типы — внизу.

---

**EN version (if needed):**

Migrate the entity or service `{EntityOrServiceName}` to the new structure as described in types.md.

- Move all Zod schemas for `{EntityOrServiceName}` from `src/schemas/models` (and related scenario extensions from `src/schemas/scenario.ts` if applicable) into a new file: `src/entities/{entityOrServiceName}.ts`.
- Move all TypeScript types for `{EntityOrServiceName}` from `src/types/{entityOrServiceName}.ts` into the same file.
- Move all CRUD parameter/response schemas for `{EntityOrServiceName}` from `src/schemas/handlers/{entityOrServiceName}.ts` into the same file.
- For service types (pubsub, uiCommon, cloud-run, instagramInsights, publishInstagram, instagramApi, common) — move all service types and schemas into the corresponding file in `src/entities`.
- For enums — move all enums into `src/entities/enums.ts`.
- Ensure all imports are local (within `src/entities` or enums from `src/entities/enums.ts`).
- Remove any duplicate or obsolete types/schemas.
- The resulting file must contain:
  - The main Zod schema for the entity/type (if applicable)
  - All related types (e.g., `I{EntityName}`, CRUD types, service types)
  - All CRUD schemas (e.g., `Create{EntityName}ParamsSchema`)
  - All API parameter/response types
  - All scenario extensions (for scenario.ts only)
- Do not include unrelated code or types from other entities/services.
- Use clear and consistent naming for all exports.
- In new files, always place Zod schemas at the top and types at the bottom.
- At the end, show a summary of what was moved, what was removed, and what was merged.

---

**NB:** After migration, add `export * from './{entityOrServiceName}';` to `src/entities/index.ts` for proper barrel imports.

**NB:** Always run `npm run lint:fix` before fixing errors.

**NB:** In new files, always place Zod schemas at the top and types at the bottom.

---

**Repeat for every business entity and service type in the project.**
