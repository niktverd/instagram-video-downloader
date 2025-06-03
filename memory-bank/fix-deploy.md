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
  - Error: Invalid format ' "small": \*\*\*'

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

## Подробный план диагностики и фикса проблемы с пустым image_tag

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

## Ошибка: Missing download info for actions/upload-artifact@v3

### Симптомы

- Workflow падает сразу после шага "Prepare all required actions"
- В логах:
  ```
  ##[error]Missing download info for actions/upload-artifact@v3
  ```

### Причина

- GitHub Actions не может найти/загрузить action `actions/upload-artifact@v3`.
- Обычно это:
  - опечатка в названии action или версии
  - временные проблемы на стороне GitHub
  - action не опубликован/удалён/недоступен для runner'а
  - workflow запускается в приватном runner'е без доступа к marketplace

### Как пофиксить

- Проверь, что используешь актуальное имя и версию:
  ```yaml
  uses: actions/upload-artifact@v3
  ```
- Если runner self-hosted — убедись, что у него есть доступ к marketplace actions.
- Иногда помогает заменить на конкретный commit:
  ```yaml
  uses: actions/upload-artifact@v3@8e4b7f2b6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2
  ```
- Если проблема массовая — проверь https://www.githubstatus.com/
- Альтернатива: временно откатиться на v2 (`actions/upload-artifact@v2`)

### TL;DR

- GitHub не может скачать upload-artifact@v3. Проверь синтаксис, доступ к actions, попробуй v2 или конкретный commit.

---

# Новый план деплоя: последовательный Cloud Run без артефактов

## TL;DR

- Деплой теперь как в cloud-run-deploy.yml: каждый tier деплоится последовательно, без передачи артефактов между job'ами.
- Все переменные (image_tag и т.д.) доступны в рамках одного job через environment или через outputs между steps.
- Нет upload/download-artifact, нет проблем с marketplace actions.
- Логика: build → deploy tier1 → deploy tier2 → deploy tier3 (каждый ждёт предыдущий).

---

## Подробный план

### 1. Build & Push Docker Image (build-image)

- Собираем docker-образ и пушим в GCR.
- Сохраняем image_tag как output step'а (echo "tag=$IMAGE_TAG" >> $GITHUB_OUTPUT).
- Не используем артефакты, только outputs между steps/job'ами.

### 2. Deploy Tier 1 (Small)

- Ждём завершения build-image.
- Берём image_tag из outputs build-image (через needs.build-image.outputs.image_tag).
- Деплоим сервис в Cloud Run с нужными ресурсами.
- Проверяем деплой, логируем URL.

### 3. Deploy Tier 2 (Medium)

- Ждём завершения tier1.
- Берём тот же image_tag.
- Деплоим второй сервис (medium tier) с другими лимитами.
- Проверяем деплой, логируем URL.

### 4. Deploy Tier 3 (Large)

- Ждём завершения tier2.
- Берём тот же image_tag.
- Деплоим третий сервис (large tier) с максимальными лимитами.
- Проверяем деплой, логируем URL.

### 5. Setup Pub/Sub (если нужно)

- После деплоя всех tier'ов настраиваем Pub/Sub топики и подписки.
- Пробрасываем нужные URL сервисов через outputs между steps.

---

## Почему так лучше

- Нет зависимости от marketplace actions (артефакты, upload-artifact).
- Всё работает на любом runner'е, даже если marketplace недоступен.
- Простая диагностика: если image_tag не пробрасывается — баг в outputs, а не во внешних actions.
- Логика полностью повторяет cloud-run-deploy.yml, только с несколькими сервисами.

---

## Диагностика и отладка

- Если деплой падает с ошибкой "--image: expected one argument" — проверь, что image_tag реально выставлен и проброшен через outputs.
- Для дебага всегда добавляй echo IMAGE_TAG перед деплоем.
- Если какой-то tier не деплоится — смотри логи предыдущего tier/job.
- Для сложных сценариев можно добавить ручной input для выбора, какие tier'ы деплоить.

---

## Примерная структура workflow (псевдокод)

```yaml
jobs:
  build-image:
    ...
    outputs:
      image_tag: ${{ steps.image.outputs.tag }}
    steps:
      ...
      - id: image
        run: |
          IMAGE_TAG=...
          ...
          echo "tag=$IMAGE_TAG" >> $GITHUB_OUTPUT

  deploy-tier1:
    needs: build-image
    ...
    steps:
      ...
      - run: |
          IMAGE_TAG="${{ needs.build-image.outputs.image_tag }}"
          ...
          gcloud run deploy ... --image $IMAGE_TAG ...

  deploy-tier2:
    needs: deploy-tier1
    ...
    steps:
      ...
      - run: |
          IMAGE_TAG="${{ needs.build-image.outputs.image_tag }}"
          ...
          gcloud run deploy ... --image $IMAGE_TAG ...

  deploy-tier3:
    needs: deploy-tier2
    ...
    steps:
      ...
      - run: |
          IMAGE_TAG="${{ needs.build-image.outputs.image_tag }}"
          ...
          gcloud run deploy ... --image $IMAGE_TAG ...
```

---

## Рекомендации

- Не усложняй: outputs между jobs — надёжно, если не передаёшь секреты.
- Для секретных данных используй environment или secrets.
- Для сложных сценариев (rollback, canary) — добавляй отдельные jobs/steps.
- Всегда логируй ключевые переменные (image_tag, service_url) для дебага.

---

## Итог

- Схема максимально простая, надёжная, повторяет cloud-run-deploy.yml, но с несколькими сервисами.
- Нет артефактов, нет upload-artifact, нет внешних зависимостей.
- Всё работает out-of-the-box на любом runner'е.

---

## Сетап Pub/Sub очередей для tiered Cloud Run

### Архитектура

- **pubsub-tier1**: основная очередь, пушит сообщения в Cloud Run сервис tier1
- **pubsub-tier2**: очередь для эскалации, пушит сообщения в Cloud Run сервис tier2
- **pubsub-tier3**: очередь для эскалации, пушит сообщения в Cloud Run сервис tier3
- **pubsub-dead**: dead-letter очередь, для ручной обработки фатальных ошибок

### Логика работы

1. Все новые задачи попадают в pubsub-tier1 (push endpoint → tier1)
2. Если tier1 не справился (max delivery attempts), сообщение эскалируется в pubsub-tier2 (push endpoint → tier2)
3. Если tier2 не справился, сообщение эскалируется в pubsub-tier3 (push endpoint → tier3)
4. Если tier3 не справился, сообщение уходит в pubsub-dead (pull subscription, ручная обработка)

### Как создать очереди и подписки

#### 1. Создать топики

```bash
gcloud pubsub topics create pubsub-tier1
# dead-letter для tier1
 gcloud pubsub topics create pubsub-tier2
# dead-letter для tier2
gcloud pubsub topics create pubsub-tier3
# dead-letter для tier3
gcloud pubsub topics create pubsub-dead
```

#### 2. Создать push подписки

```bash
# Tier1 push
 gcloud pubsub subscriptions create pubsub-tier1-push \
  --topic=pubsub-tier1 \
  --push-endpoint="https://<tier1-service-url>/api/cloud-run/run-scenario" \
  --ack-deadline=300 \
  --dead-letter-topic=pubsub-tier2 \
  --max-delivery-attempts=3

# Tier2 push
 gcloud pubsub subscriptions create pubsub-tier2-push \
  --topic=pubsub-tier2 \
  --push-endpoint="https://<tier2-service-url>/api/cloud-run/run-scenario" \
  --ack-deadline=600 \
  --dead-letter-topic=pubsub-tier3 \
  --max-delivery-attempts=3

# Tier3 push
 gcloud pubsub subscriptions create pubsub-tier3-push \
  --topic=pubsub-tier3 \
  --push-endpoint="https://<tier3-service-url>/api/cloud-run/run-scenario" \
  --ack-deadline=1000 \
  --dead-letter-topic=pubsub-dead \
  --max-delivery-attempts=3

# Dead-letter (pull)
gcloud pubsub subscriptions create pubsub-dead-pull \
  --topic=pubsub-dead \
  --ack-deadline=600 \
  --message-retention-duration=7d
```

#### 3. Как это интегрируется с Cloud Run

- Каждый сервис (tier1, tier2, tier3) слушает свой push endpoint `/api/cloud-run/run-scenario`
- Pub/Sub сам пушит сообщения в нужный сервис
- Эскалация между очередями автоматическая через dead-letter-topic
- Для ручной обработки dead_queue используем pull:
  ```bash
  gcloud pubsub subscriptions pull pubsub-dead-pull --auto-ack
  ```

### Рекомендации

- Всегда логируй push endpoint и URL сервисов после деплоя
- Для теста можно вручную публиковать сообщения в pubsub-tier1:
  ```bash
  gcloud pubsub topics publish pubsub-tier1 --message '{"foo": "bar"}'
  ```
- Для мониторинга dead_queue — настроить алерты или периодически проверять вручную

### Диагностика

- Если сообщения не эскалируются — проверь dead-letter-topic и max-delivery-attempts
- Если сервис не получает сообщения — проверь правильность push endpoint и IAM permissions
- Если dead_queue быстро растёт — смотри логи tier3 и причину фейлов

---

## Итог

- 3 push Pub/Sub очереди (tier1, tier2, tier3) + 1 dead-letter pull очередь
- Эскалация задач между очередями через dead-letter-topic
- Всё пушится напрямую в Cloud Run сервисы, без ручного проброса URL
- dead_queue для ручной обработки фатальных ошибок

---

## Ошибка: denied: Unauthenticated request при docker push в GCR

### Симптомы

- На шаге docker push (или gcloud run deploy) появляется ошибка:
  ```
  denied: Unauthenticated request. Unauthenticated requests do not have permission "artifactregistry.repositories.uploadArtifacts" ...
  ```
- Push в GCR/GAR не работает, деплой падает

### Причина

- В workflow не добавлен шаг аутентификации в Google Cloud через `google-github-actions/auth@v2`
- Без этого docker push не авторизован, даже если setup-gcloud уже был
- В cloud-run-deploy.yml этот шаг есть, а в deploy-tiered-infrastructure.yml — нет

### Как пофиксить

- Добавь шаг аутентификации в каждый job, где нужен доступ к GCP (build-image, deploy-tier1, deploy-tier2, deploy-tier3, setup-pubsub):
  ```yaml
  - id: 'auth'
    uses: 'google-github-actions/auth@v2'
    with:
      credentials_json: '${{ secrets.GCP_SA_KEY }}'
  ```
- Этот шаг должен идти до setup-gcloud и до docker push

### TL;DR

- Без auth@v2 docker push всегда будет denied. Всегда делай аутентификацию, как в cloud-run-deploy.yml

## Почему в cloud-run-deploy.yml нет проблемы с output 'image_tag' (секреты)

### Как устроено:
- В cloud-run-deploy.yml нет передачи image_tag между jobs через outputs вообще — всё делается в рамках одного job (deploy).
- PROJECT_ID и SERVICE_NAME пробрасываются через env, но не используются как output между jobs.
- Docker image тег формируется прямо в step'ах деплоя:
  ```bash
  docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA .
  docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA
  gcloud run deploy ... --image gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA ...
  ```
- Все переменные окружения (PROJECT_ID, SERVICE_NAME, REGION) доступны внутри job, но не пробрасываются как output между jobs.
- Нет ни одного output, который GitHub мог бы посчитать секретом и зарезать.

### Почему это работает всегда
- GitHub режет outputs между jobs, если думает, что там секрет (например, если в output есть ${{ secrets.* }}).
- В cloud-run-deploy.yml нет передачи outputs между jobs, поэтому ничего не режется.
- Всё, что нужно для деплоя, формируется и используется внутри одного job.

### Выводы для multi-tier деплоя
- Если не хочешь использовать артефакты — делай build и deploy в одном job (или step chain), чтобы не было передачи outputs между jobs.
- Если нужен именно multi-job workflow — не формируй image_tag с использованием secrets, либо используй артефакты.
- Самый надёжный способ: build+deploy в одном job, как в cloud-run-deploy.yml.

---

## Как пробрасывать секреты и переменные окружения в Cloud Run (по примеру cloud-run-deploy.yml)

### Как реализовано в cloud-run-deploy.yml
- Для передачи секретов используется флаг:
  ```
  --update-secrets FIREBASE_CONFIG=FIREBASE_CONFIG:latest,FIREBASE_CONFIG_REELS_CREATOR=FIREBASE_CONFIG_REELS_CREATOR:latest,POSTGRES_CONFIG=POSTGRES_CONFIG:latest
  ```
  Это связывает переменные окружения внутри контейнера с секретами из Secret Manager.
- Для передачи обычных переменных окружения используется флаг:
  ```
  --set-env-vars APP_ENV=cloud-run,PUBSUB_TOPIC_NAME=$TOPIC_NAME,ENABLE_STDERR=false,ENABLE_PROGRESS=false,ENABLE_START=false,ENABLE_DOWNLOAD_VIDEO=false,ENABLE_RUN_SCENARIO_VIDEO=false,ENABLE_PUBSUB=true
  ```
- Эти флаги обязательно указывать при каждом деплое (и для новых сервисов, и для update).

### Почему это важно
- Без этих флагов контейнер не получит нужные переменные и секреты, и скорее всего не стартует (или будет падать с ошибкой).
- Cloud Run не "наследует" переменные окружения и секреты от предыдущих ревизий, если их не указать явно при деплое.

### Пример для multi-tier деплоя
В каждом gcloud run deploy (tier1, tier2, tier3) должно быть:
```bash
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_TAG \
  --region $REGION \
  --platform managed \
  --memory ... \
  --cpu ... \
  --max-instances ... \
  --update-secrets FIREBASE_CONFIG=FIREBASE_CONFIG:latest,FIREBASE_CONFIG_REELS_CREATOR=FIREBASE_CONFIG_REELS_CREATOR:latest,POSTGRES_CONFIG=POSTGRES_CONFIG:latest \
  --set-env-vars APP_ENV=cloud-run,PUBSUB_TOPIC_NAME=$TOPIC_NAME,ENABLE_STDERR=false,ENABLE_PROGRESS=false,ENABLE_START=false,ENABLE_DOWNLOAD_VIDEO=false,ENABLE_RUN_SCENARIO_VIDEO=false,ENABLE_PUBSUB=true \
  --allow-unauthenticated
```

### Рекомендации
- TOPIC_NAME и другие переменные должны быть определены в env или через $GITHUB_ENV.
- Если секреты называются иначе — подставь свои имена.
- Без этих флагов контейнер не увидит нужные переменные и может не стартовать (ошибка PORT, падение по env, и т.д.).

**TL;DR:**
- Всегда пробрасывай секреты и env через --update-secrets и --set-env-vars для каждого Cloud Run деплоя, как в cloud-run-deploy.yml.


How much quota you will require  : 
Project Number: 
Project ID: 
Billing Account ID: 
Full Office HQ address:
 Use case (why do you are adding the request or how you will use the services after the request is completed): 
Budget: (Estimated monthly budget for the request): 
Current monthly spent on GCP : 
Alternate Contact information:
Final Decision maker ( Along with you if you have any)