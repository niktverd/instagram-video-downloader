# .github каталог: структура и навигационный промпт для фикса деплой флоу

## Общая структура

- `.github/workflows/` — все CI/CD workflows (GitHub Actions)
  - `deploy-tiered-infrastructure.yml` — основной multi-tier деплой (small/medium/large, PubSub, dead-letter queues, эскалация ресурсов)
  - `cloud-run-deploy.yml` — single-tier деплой (2GB/1CPU, без эскалации)
  - `shared-config.yml` — workflow для централизованной конфигурации (project_id, region, base service name, PubSub topics)
  - `README.md` — схема архитектуры, описание триггеров, ручных опций, мониторинга, cost-оптимизации
- `.github/actions/` — кастомные actions для reuse
  - `shared-vars/action.yml` — экспортирует project_id, регион и JSON с конфигами сервисов (имя, ресурсы, лимиты для small/medium/large)
- `.github/config/` — переменные окружения для всех workflow
  - `shared.env` — значения для project_id, регион, имена топиков, лимиты ресурсов для tier'ов

## Кратко по основным workflow

- **deploy-tiered-infrastructure.yml**
  - Multi-tier: small (1GB/1CPU, 100 инстансов), medium (2GB/1CPU, 10), large (4GB/2CPU, 2)
  - Эскалация: задачи идут по цепочке через dead-letter PubSub topics
  - Триггеры: PR в main (merge) или ручной запуск (branch, deploy_mode)
  - deploy_mode: all / small-only / medium-only / large-only / update-pubsub-only
  - Использует кастомный action shared-vars и shared.env
- **cloud-run-deploy.yml**
  - Single-tier: 2GB/1CPU, до 10 инстансов
  - Триггеры: PR в main (merge) или ручной запуск (branch)
  - Создаёт/обновляет PubSub topic и push subscription
- **shared-config.yml**
  - Workflow для передачи project_id, region, base service name, PubSub topics в другие workflow через workflow_call

## Shared конфиги

- **shared-vars/action.yml**: JSON с параметрами для каждого tier (имя, ресурсы, лимиты)
- **shared.env**: переменные окружения для всех workflow (project_id, region, имена топиков, лимиты ресурсов)

## Мониторинг и dead-letter

- Dead-letter queue: instagram-video-tasks-dead-3 (ручная обработка)
- Проверка сообщений:
  ```bash
  gcloud pubsub subscriptions pull instagram-video-tasks-dead-3-pull --auto-ack
  ```

---

## Навигационный промпт для фикса деплой флоу

- Для изменения ресурсов/лимитов — смотри `.github/actions/shared-vars/action.yml` и `.github/config/shared.env`
- Для изменения архитектуры/эскалации — смотри `.github/workflows/deploy-tiered-infrastructure.yml` и `README.md`
- Для single-tier деплоя — смотри `.github/workflows/cloud-run-deploy.yml`
- Для передачи переменных между workflow — смотри `.github/workflows/shared-config.yml`
- Для переменных окружения — смотри `.github/config/shared.env`
- Для мониторинга dead-letter — смотри секцию Monitoring в `README.md`

Если фиксим деплой флоу — сначала определяем, какой tier/workflow/ресурс/триггер/секрет/переменная окружения нужен, потом ищем нужный файл по навигационному промпту выше. 

---

## План обновления деплой workflow (динамический выбор ветки через "Use workflow from")

1. **Удалить input `branch` из workflow_dispatch**
   - В файле `.github/workflows/deploy-tiered-infrastructure.yml` (и других, если есть):
     - Убрать секцию inputs: branch
     - Оставить только нужные inputs (например, deploy_mode)

2. **Обновить шаги checkout**
   - Везде, где используется actions/checkout, явно указать:
     ```yaml
     - uses: actions/checkout@v3
       with:
         ref: ${{ github.ref }}
     ```
   - Это гарантирует, что код и workflow берутся из выбранной в UI ветки

3. **Удалить все упоминания/использование inputs.branch**
   - Везде, где было `${{ github.event.inputs.branch }}` — заменить на `${{ github.ref }}`
   - Проверить, чтобы не было рассинхрона между workflow-файлом и кодом

4. **Обновить документацию**
   - В `.github/workflows/README.md` и других доках:
     - Убрать описание ручного выбора ветки через input
     - Добавить пояснение: "Ветка для деплоя выбирается через стандартный GitHub UI (Use workflow from)"

5. **Проверить все workflow, где был input branch**
   - Повторить шаги 1-4 для всех workflow, где был input branch

6. **Проверить, что deploy_mode и другие inputs работают как раньше**
   - Оставить только реально нужные inputs (например, deploy_mode)
   - Проверить, что dropdown для deploy_mode работает корректно

7. **Smoke-тест**
   - Запустить workflow из разных веток через UI
   - Убедиться, что деплой и билд идут из выбранной ветки, а не из main по умолчанию

---

**Результат:**
- Нет дублирования выбора ветки
- Всегда деплоится именно тот код, который выбран в "Use workflow from"
- Меньше путаницы, проще поддержка, меньше багов 