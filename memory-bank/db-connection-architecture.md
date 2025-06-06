# Размышления о лимите connections к базе и архитектуре

## Проблема

- В базе есть жёсткое ограничение: максимум 20 connections.
- Cloud Run контейнеры (или любые serverless-инстансы) при масштабировании могут легко превысить этот лимит, если каждый открывает своё соединение.
- Итог: ошибки соединения, падения, невозможность обслуживать нагрузку.

## Текущий паттерн (антипаттерн для serverless)

- Каждый контейнер сам ходит в базу (открывает connection или пул).
- При росте числа контейнеров connections быстро заканчиваются.

## Решение: Выделенный сервер-«прокси» к базе

- Один сервер (например, Express/Node.js) держит соединения с базой.
- Все Cloud Run контейнеры делают REST-запросы к этому серверу для чтения/записи.
- Только этот сервер держит connections к базе (например, 1-3, сколько нужно, но не больше лимита).
- Cloud Run контейнеры не открывают connections к базе вообще.

### Плюсы

- Полный контроль над количеством connections к базе.
- Можно кэшировать, делать rate limiting, оптимизировать запросы.
- Cloud Run контейнеры не влияют на лимит базы.

### Минусы

- Появляется дополнительная задержка (REST-запросы).
- Точка отказа: если сервер упал — все контейнеры не могут работать с базой.
- Нужно реализовать API для всех нужных операций.

## Альтернативы

- Использовать managed connection pooler (например, PgBouncer для Postgres).
- Использовать базу, поддерживающую serverless-friendly connection model (например, Cloud Spanner, Aurora Serverless, PlanetScale и т.д.).
- Кэшировать часто используемые данные вне базы (Redis, Memcached, in-memory).

## Вывод

- Если лимит connections непреодолим, выделенный сервер-прокси — рабочий и часто используемый паттерн для serverless/cloud-run.
- Это уменьшает connections к базе до количества connections у выделенного сервера.
- Cloud Run контейнеры не грузят базу напрямую.
- Минусы — задержка и точка отказа, но плюсы перевешивают при жёстком лимите.
