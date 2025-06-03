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

---

## Ошибка при запуске Deploy Small Tier (shared-vars/action.yml)

### Симптомы
- Job "Deploy Small Tier (1GB/1CPU)" падает на шаге "Get shared vars"
- Логи:
  - Error: Unable to process file command 'output' successfully.
  - Error: Invalid format '  "small": ***'

### Причина
- В кастомном action .github/actions/shared-vars/action.yml используется конструкция:
  ```bash
  cat << 'EOF' >> $GITHUB_OUTPUT
  service_configs={ ... }
  EOF
  ```
- GitHub Actions runner ожидает, что каждая строка, которую мы пишем в $GITHUB_OUTPUT, будет в формате `key=value` (одна строка — один output).
- Если в $GITHUB_OUTPUT попадает многострочный JSON или любая строка, не соответствующая формату key=value, runner падает с ошибкой "Invalid format".
- В данном случае весь JSON service_configs пишется как одна большая строка, но с переносами строк, что ломает парсер outputs.

### Итог
- Ошибка не в YAML workflow, а в bash-скрипте кастомного action: нельзя писать многострочные значения в $GITHUB_OUTPUT через cat << EOF.
- Нужно сериализовать JSON в одну строку (без переносов) и писать одной строкой: echo "service_configs=<json>" >> $GITHUB_OUTPUT

---

## Ошибка: gcloud run deploy --image: expected one argument

### Симптомы
- На шаге деплоя (Deploy Small Tier) падает с ошибкой:
  - ERROR: (gcloud.run.deploy) argument --image: expected one argument
  - Usage: gcloud run deploy ... --image IMAGE ...
- Exit code 2

### Причина
- Переменная ${{ needs.build-image.outputs.image_tag }} пуста или невалидна (скорее всего, не была выставлена на предыдущем шаге или не проброшена как output).
- В результате команда:
  ```bash
  gcloud run deploy $SERVICE_NAME \
    --image ${{ needs.build-image.outputs.image_tag }} \
    ...
  ```
  превращается в:
  ```bash
  gcloud run deploy instagram-downloader-small --image  ...
  ```
  (без значения для --image)
- gcloud требует обязательный аргумент для --image, иначе падает с этой ошибкой.

### Как диагностировать
- Проверить, что шаг build-image реально выставляет output image_tag и что он не пустой.
- Проверить, что в deploy-small-tier (и других tier) используется именно этот output.
- В логах build-image найти строку echo "tag=$IMAGE_TAG" >> $GITHUB_OUTPUT — убедиться, что $IMAGE_TAG не пустой.
- В логах deploy-small-tier добавить debug echo перед деплоем:
  ```bash
  echo "IMAGE_TAG=${{ needs.build-image.outputs.image_tag }}"
  ```

### Возможные причины пустого image_tag
- Шаг build-image не выполнился или завершился с ошибкой.
- Ошибка в синтаксисе outputs (например, неправильный id шага или неправильное имя output).
- Ошибка в логике if для запуска build-image.

---