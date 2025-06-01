# Структура каталогов проекта

- **app.ts, index.ts** — точка входа, запуск Express-сервера
- **package.json, tsconfig.json, Dockerfile** — конфиги, сборка, зависимости
- **src/** — основная бизнес-логика
  - **sections/** — фичевые модули (Instagram, YouTube, UI, pubsub, cloud-run и др.)
    - **instagram/** — логика Instagram: controllers, routes, utils, components
    - **youtube/** — интеграция с YouTube
    - **ui/** — API для UI/фронта
    - **pubsub/** — интеграция с pubsub
    - **cloud-run/** — сервисы для деплоя/инфры
    - **chore/** — вспомогательные задачи
    - **shared/** — общее для секций
  - **models/** — бизнес-сущности (User, Account, Scenario, Video и др.)
  - **services/** — сервисы (UserService и др.)
  - **db/** — слой работы с БД (таблицы, методы)
  - **utils/** — утилиты, логи, ошибки, pubsub-клиент
  - **types/** — типы и контракты
  - **schemas/** — схемы валидации данных
  - **config/** — конфиги
  - **entities/** — (пусто/зарезервировано)
  - **actions, scripts, tests** — экшены, скрипты, тесты
- **migrations/** — миграции для БД
- **seeds/** — сиды для БД (пусто)
- **public/** — статика, фронтовые ассеты
- **assets/** — медиа, изображения, аудио
- **videos-working-directory/** — рабочая директория для видео
- **report/** — отчёты по коду, графы зависимостей
- **memory-bank/** — твоя память: concept.md, structure.md и др.
- **sharedTypes/** — общие типы между сервисами
- **uitls/** — (опечатка, утилиты)
- **testApi/** — тестовые контроллеры и утилиты
- **docs/** — документация, инструкции
- **.github, .husky** — CI/CD, хуки
- **dist, node_modules** — сборка и зависимости (автоматически)

# Инструкция: Как правильно составлять модель (model) в проекте

## 1. Zod-схема (валидация и shape)

- Создаётся в `src/schemas/models/{entity}.ts`
- Пример:

```ts
import {z} from 'zod';

export const AccountSchema = z.object({
  id: z.number(),
  slug: z.string(),
  enabled: z.boolean(),
  token: z.string().optional(),
  userIdIG: z.string().nullable().optional(),
  // ... другие поля
});
```

## 2. Интерфейс (типизация)

- В `src/types/{entity}.ts`
- Строится через z.infer<typeof ...Schema> из схемы
- Пример:

```ts
import {AccountSchema} from '#schemas/models/account';
export type IAccount = z.infer<typeof AccountSchema>;
```

## 3. Модель (model)

- В `src/models/{Entity}.ts`
- Класс наследует BaseModel (которая наследует от Objection Model)
- Реализует интерфейс (implements IAccount)
- Описывает поля, связи, tableName, idColumn
- Пример:

```ts
import {BaseModel} from './BaseModel';
import {IAccount} from '#src/types/account';

export class Account extends BaseModel implements IAccount {
    id!: number;
    slug!: string;
    enabled!: boolean;
    token?: string;
    userIdIG?: string | null;
    // ...
    static get tableName() { return 'accounts'; }
    static get idColumn() { return 'id'; }
    static get relationMappings() { ... }
}
```

## 4. Связи (relations)

- Описываются в relationMappings через другие модели
- Пример:

```ts
static get relationMappings() {
    return {
        availableScenarios: {
            relation: BaseModel.ManyToManyRelation,
            modelClass: Scenario,
            join: { ... },
        },
        instagramLocations: { ... },
    };
}
```

## 5. Итоговая структура

- **Zod-схема** — shape и валидация
- **Интерфейс** — типизация через z.infer<typeof Schema>
- **Модель** — класс, реализующий интерфейс, описывает tableName, поля, связи
- Всё синхронизировано: меняешь схему — меняется тип, меняешь тип — меняется shape модели

## 6. Пример для любого Entity

- Zod-схема: `src/schemas/models/{entity}.ts`
- Интерфейс: `src/types/{entity}.ts`
- Модель: `src/models/{Entity}.ts`

---

**Рекомендация:**

- Всегда начинай с Zod-схемы
- Интерфейс — только через z.infer
- Модель — всегда implements I{Entity}
- Не дублируй поля руками, всё через схему и типизацию

# Примеры структуры для каждой модели

## Account

- Zod-схема: `src/schemas/models/account.ts`
- Интерфейс: `src/types/account.ts`
- Модель: `src/models/Account.ts`

```ts
// src/schemas/models/account.ts
export const AccountSchema = z.object({
    id: z.number(),
    slug: z.string(),
    enabled: z.boolean(),
    token: z.string().optional(),
    userIdIG: z.string().nullable().optional(),
});

// src/types/account.ts
export type IAccount = z.infer<typeof AccountSchema>;

// src/models/Account.ts
export class Account extends BaseModel implements IAccount {
    id!: number;
    slug!: string;
    enabled!: boolean;
    token?: string;
    userIdIG?: string | null;
    static get tableName() { return 'accounts'; }
    static get idColumn() { return 'id'; }
    static get relationMappings() { ... }
}
```

## InstagramLocation

- Zod-схема: `src/schemas/models/instagram-location.ts`
- Интерфейс: `src/types/instagramLocation.ts`
- Модель: `src/models/InstagramLocation.ts`

```ts
// src/schemas/models/instagram-location.ts
export const InstagramLocationSchema = z.object({
  id: z.number(),
  externalId: z.string(),
  name: z.string().nullable().optional(),
  // ...
});

// src/types/instagramLocation.ts
export type IInstagramLocation = z.infer<typeof InstagramLocationSchema>;

// src/models/InstagramLocation.ts
export class InstagramLocation extends BaseModel implements IInstagramLocation {
  id!: number;
  externalId!: string;
  name?: string | null;
  static get tableName() {
    return 'instagramLocations';
  }
  static get idColumn() {
    return 'id';
  }
}
```

## InstagramMediaContainer

- Zod-схема: `src/schemas/models/instagramMediaContainer.ts`
- Интерфейс: `src/types/instagramMediaContainer.ts`
- Модель: `src/models/InstagramMediaContainer.ts`

```ts
// src/schemas/models/instagramMediaContainer.ts
export const InstagramMediaContainerSchema = z.object({
  id: z.number(),
  preparedVideoId: z.number(),
  accountId: z.number(),
  // ...
});

// src/types/instagramMediaContainer.ts
export type IInstagramMediaContainer = z.infer<typeof InstagramMediaContainerSchema>;

// src/models/InstagramMediaContainer.ts
export class InstagramMediaContainer extends BaseModel implements IInstagramMediaContainer {
  id!: number;
  preparedVideoId!: number;
  accountId!: number;
  static get tableName() {
    return 'instagramMediaContainers';
  }
  static get idColumn() {
    return 'id';
  }
}
```

## PreparedVideo

- Zod-схема: `src/schemas/models/preparedVideo.ts`
- Интерфейс: `src/types/preparedVideo.ts`
- Модель: `src/models/PreparedVideo.ts`

```ts
// src/schemas/models/preparedVideo.ts
export const PreparedVideoSchema = z.object({
  id: z.number(),
  firebaseUrl: z.string(),
  duration: z.number().optional(),
  // ...
});

// src/types/preparedVideo.ts
export type IPreparedVideo = z.infer<typeof PreparedVideoSchema>;

// src/models/PreparedVideo.ts
export class PreparedVideo extends BaseModel implements IPreparedVideo {
  id!: number;
  firebaseUrl!: string;
  duration?: number;
  static get tableName() {
    return 'preparedVideos';
  }
  static get idColumn() {
    return 'id';
  }
}
```

## Scenario

- Zod-схема: `src/schemas/models/scenario.ts`
- Интерфейс: `src/types/scenario.ts`
- Модель: `src/models/Scenario.ts`

```ts
// src/schemas/models/scenario.ts
export const ScenarioSchema = z.object({
  id: z.number(),
  slug: z.string(),
  enabled: z.boolean(),
  // ...
});

// src/types/scenario.ts
export type IScenario = z.infer<typeof ScenarioSchema>;

// src/models/Scenario.ts
export class Scenario extends BaseModel implements IScenario {
  id!: number;
  slug!: string;
  enabled = true;
  static get tableName() {
    return 'scenarios';
  }
  static get idColumn() {
    return 'id';
  }
}
```

## Source

- Zod-схема: `src/schemas/models/source.ts`
- Интерфейс: `src/types/source.ts`
- Модель: `src/models/Source.ts`

```ts
// src/schemas/models/source.ts
export const SourceSchema = z.object({
  id: z.number(),
  firebaseUrl: z.string(),
  // ...
});

// src/types/source.ts
export type ISource = z.infer<typeof SourceSchema>;

// src/models/Source.ts
export class Source extends BaseModel implements ISource {
  id!: number;
  firebaseUrl!: string;
  static get tableName() {
    return 'sources';
  }
  static get idColumn() {
    return 'id';
  }
}
```

## User

- Zod-схема: `src/schemas/models/user.ts`
- Интерфейс: `src/types/user.ts`
- Модель: `src/models/User.ts`

```ts
// src/schemas/models/user.ts
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  // ...
});

// src/types/user.ts
export type IUser = z.infer<typeof UserSchema>;

// src/models/User.ts
export class User extends BaseModel implements IUser {
  id!: number;
  email!: string;
  static get tableName() {
    return 'users';
  }
  static get idColumn() {
    return 'id';
  }
}
```
