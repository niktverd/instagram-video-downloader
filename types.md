# План миграции типов и схем в единую структуру (актуализировано)

## Важно: миграция сервисных и бизнес-типов

- Все типы, которые не относятся к бизнес-сущностям, но используются в сервисах/контроллерах (например, pubsub, uiCommon, cloud-run, instagramInsights, publishInstagram и т.д.), должны быть перенесены из src/types/{name}.ts в отдельные файлы в src/entities:
  - src/entities/pubsub.ts
  - src/entities/uiCommon.ts
  - src/entities/cloud-run.ts
  - src/entities/instagramInsights.ts
  - src/entities/publishInstagram.ts
- После переноса добавить `export * from './{name}';` в src/entities/index.ts
- Иначе импорты вида `import {PushPubSubTestParams} from '#src/entities'` работать не будут, и возникнут ошибки Module has no exported member

## Этап 1. Подготовка

- Проанализировать все текущие файлы в src/types, src/schemas/models, src/schemas/handlers, src/schemas/scenario.ts
- Составить список всех сущностей и сервисных типов (см. полный список ниже)
  - Бизнес-сущности: Account, Scenario, InstagramLocation, InstagramMediaContainer, PreparedVideo, Source, User
  - Сервисные типы: pubsub, uiCommon, cloud-run, instagramInsights, publishInstagram, instagramApi, enums, common
  - Все CRUD-типы и параметры/ответы для API (CreateAccountParams, GetAllUsersResponse и т.д.)
  - Все объединяющие типы (ScenarioV4, MediaPostModel, ...)
  - Все enum'ы (Collection, ScenarioType, InstagramLocationSource и т.д.)

## Этап 2. Создание новой структуры

- Создать каталог src/entities
- Для каждой бизнес-сущности создать файл: account.ts, scenario.ts, instagramLocation.ts, instagramMediaContainer.ts, preparedVideo.ts, source.ts, user.ts
- Для сервисных типов создать отдельные файлы: pubsub.ts, uiCommon.ts, cloud-run.ts, instagramInsights.ts, publishInstagram.ts, instagramApi.ts, common.ts
- Для enum'ов — enums.ts
- Создать index.ts для экспорта всех сущностей и сервисных типов

## Этап 3. Миграция кода по сущностям и сервисам

- Для каждой сущности:
  - Перенести Zod-схему из models/
  - Перенести все типы из types/
  - Перенести все CRUD-схемы из handlers/
  - Перенести расширения сценариев (scenario.ts) в scenario.ts
  - Обеспечить, чтобы все импорты были локальными (в пределах src/entities)
  - Удалить дублирующиеся и устаревшие типы/схемы
- Для сервисных типов:
  - Перенести все типы и схемы в соответствующие файлы
  - Проверить, что все параметры/ответы для API и служебные типы (PubSubPayload, CloudRunCreateScenarioVideoParams и т.д.) перенесены

## Этап 4. Миграция перечислений

- Перенести все enum'ы в enums.ts
- Обновить импорты во всех сущностях и сервисах

## Этап 5. Обновление index.ts

- Экспортировать все схемы, типы, CRUD-схемы и enum'ы из index.ts
- Проверить, что внешний API типов не изменился

## Этап 6. Рефакторинг импортов по проекту

- Заменить все импорты из src/types, src/schemas/models, src/schemas/handlers на импорты из src/entities
- Проверить корректность работы автокомплита и типизации

## Этап 7. Удаление старой структуры

- Удалить каталоги src/types, src/schemas/models, src/schemas/handlers, src/schemas/scenario.ts
- Проверить, что проект собирается и проходят все тесты

## Этап 8. Документация

- Обновить types.md, README и внутренние комментарии по новой структуре
- В types.md поддерживать актуальный список всех типов, enum'ов и их распределение по файлам

---

# Итоговая структура каталога типов и схем (актуализировано)

```
src/entities/
  account.ts
  scenario.ts
  instagramLocation.ts
  instagramMediaContainer.ts
  preparedVideo.ts
  source.ts
  user.ts
  pubsub.ts
  uiCommon.ts
  cloud-run.ts
  instagramInsights.ts
  publishInstagram.ts
  instagramApi.ts
  common.ts
  enums.ts
  index.ts
```

- Каждый файл содержит:
  - Zod-схему сущности (если применимо)
  - Все типы (IAccount, IScenario, ...)
  - CRUD-схемы (CreateAccountParamsSchema и т.д.)
  - Все параметры/ответы для API
  - Всё, что касается сценариев — в scenario.ts
  - Все служебные типы — в соответствующих сервисных файлах
- enums.ts — все перечисления
- index.ts — экспортирует всё из всех файлов

---

# Полный список типов и enum'ов смотри в конце файла (актуализируется автоматически)
