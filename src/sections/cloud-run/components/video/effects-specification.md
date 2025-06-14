# Спецификация примитивов эффектов VideoPipeline

## Базовая структура метода

```typescript
methodName(param1?: type, param2?: type): VideoPipeline {
    return this.wrap(() => {
        // логика создания фильтров
        return [filter1, filter2, ...filterN];
    });
}
```

## Ключевые принципы

1. **Используй `wrap()` функцию** - она автоматически добавляет фильтры в пайплайн и возвращает `this` для chaining

2. **Возвращай массив `ComplexFilter[]`** из lambda функции в `wrap()`

3. **Управляй потоками через методы класса**:
   - `this.currentVideoStream` - текущий видео поток
   - `this.currentAudioStream` - текущий аудио поток
   - `this.getNewVideoStream()` - создает новый уникальный видео поток
   - `this.getNewAudioStream()` - создает новый уникальный аудио поток

## Структура ComplexFilter

```typescript
const filter: ComplexFilter = {
  filter: 'filter_name', // название FFmpeg фильтра
  inputs: inputStream, // строка или массив строк входных потоков
  outputs: outputStream, // строка или массив строк выходных потоков
  options: {
    // опциональные параметры фильтра
    param1: value1,
    param2: value2,
  },
};
```

## Паттерны по сложности

### Простой эффект (по примеру makeItRed)

```typescript
simpleEffect(): VideoPipeline {
    return this.wrap(() => {
        const inputLabel = this.currentVideoStream;
        const outputLabel = this.getNewVideoStream();

        const filter: ComplexFilter = {
            filter: 'effect_name',
            inputs: inputLabel,
            outputs: outputLabel,
            options: { /* параметры */ }
        };

        return [filter];
    });
}
```

### Изменение скорости (changeSpeed)

```typescript
changeSpeed(speed: number): VideoPipeline {
    if (typeof speed !== 'number' || speed < 0.5 || speed > 2.0) throw new Error('invalid');
    if (speed === 1.0) return this.wrap(() => []);
    return this.wrap(() => {
        const videoFilter: ComplexFilter = {
            filter: 'setpts',
            inputs: this.currentVideoStream,
            outputs: this.getNewVideoStream(),
            options: {expr: `${1 / speed}*PTS`},
        };
        const audioFilter: ComplexFilter = {
            filter: 'atempo',
            inputs: this.currentAudioStream,
            outputs: this.getNewAudioStream(),
            options: {tempo: speed},
        };
        return [videoFilter, audioFilter];
    });
}
```

### Цепочка эффектов (по примеру makeItRed с двумя фильтрами)

```typescript
chainedEffect(): VideoPipeline {
    return this.wrap(() => {
        const inputLabel = this.currentVideoStream;
        const intermediateLabel = this.getNewVideoStream();
        const finalLabel = this.getNewVideoStream();

        const filter1: ComplexFilter = {
            filter: 'first_filter',
            inputs: inputLabel,
            outputs: intermediateLabel,
            options: { /* параметры */ }
        };

        const filter2: ComplexFilter = {
            filter: 'second_filter',
            inputs: intermediateLabel,
            outputs: finalLabel,
            options: { /* параметры */ }
        };

        return [filter1, filter2];
    });
}
```

### Сложный эффект с split/overlay (по примеру rotate)

```typescript
complexEffect(): VideoPipeline {
    return this.wrap(() => {
        const sourceLabel = this.currentVideoStream;

        // 1. Split входной поток
        const stream1Label = this.getNewVideoStream();
        const stream2Label = this.getNewVideoStream();
        const splitFilter: ComplexFilter = {
            filter: 'split',
            inputs: sourceLabel,
            outputs: [stream1Label, stream2Label],
            options: { outputs: 2 }
        };

        // 2. Обработка первого потока
        const processed1Label = this.getNewVideoStream();
        const process1Filter: ComplexFilter = {
            filter: 'process1',
            inputs: stream1Label,
            outputs: processed1Label,
            options: { /* параметры */ }
        };

        // 3. Обработка второго потока
        const processed2Label = this.getNewVideoStream();
        const process2Filter: ComplexFilter = {
            filter: 'process2',
            inputs: stream2Label,
            outputs: processed2Label,
            options: { /* параметры */ }
        };

        // 4. Combine потоки
        const finalLabel = this.getNewVideoStream();
        const combineFilter: ComplexFilter = {
            filter: 'overlay', // или другой combining фильтр
            inputs: [processed1Label, processed2Label],
            outputs: finalLabel,
            options: { /* параметры */ }
        };

        return [splitFilter, process1Filter, process2Filter, combineFilter];
    });
}
```

### colorCorrect() - цветокоррекция

- Применяет eq фильтр с параметрами brightness, contrast, saturation, gamma

### changeSpeed() - изменение скорости

- Применяет setpts к видео и atempo к аудио
- Поддерживает диапазон 0.5–2.0, 1.0 — no-op
- Обновляет compoundDuration
- Валидирует параметры и выбрасывает ошибки при некорректных значениях

### makeItRed() - простая цепочка

```typescript
simpleEffect(): VideoPipeline {
    return this.wrap(() => {
        const inputLabel = this.currentVideoStream;
        const outputLabel = this.getNewVideoStream();

        const filter: ComplexFilter = {
            filter: 'effect_name',
            inputs: inputLabel,
            outputs: outputLabel,
            options: { /* параметры */ }
        };

        return [filter];
    });
}
```

## Специальные случаи

### Метод concat для соединения пайплайнов

```typescript
concat(p: VideoPipeline): VideoPipeline {
    return this.wrap(() => {
        if (!this.isMaster) {
            throw new Error('Concat can only be called on a master VideoPipeline');
        }

        // 1. Добавляем inputs из другого пайплайна
        this.inputs.push(...p.inputs);
        const masterInputIdx = this.inputs.length - 1;

        // 2. Перелабелируем фильтры для избежания конфликтов
        const relabeledFilters = relabelPipelineStreams(p, masterInputIdx);

        // 3. Создаем concat фильтр
        const concatVideoLabel = this.getNewVideoStream();
        const concatAudioLabel = this.getNewAudioStream();
        const concatInputs = [
            this.currentVideoStream, this.currentAudioStream,
            p.currentVideoStream, p.currentAudioStream
        ];

        const concatFilter: ComplexFilter = {
            filter: 'concat',
            inputs: concatInputs,
            outputs: [concatVideoLabel, concatAudioLabel],
            options: { n: 2, v: 1, a: 1 }
        };

        return [...relabeledFilters, concatFilter];
    });
}
```

### Эффект с аудио

```typescript
effectWithAudio(): VideoPipeline {
    return this.wrap(() => {
        const videoInput = this.currentVideoStream;
        const audioInput = this.currentAudioStream;

        const videoOutput = this.getNewVideoStream();
        const audioOutput = this.getNewAudioStream();

        const videoFilter: ComplexFilter = {
            filter: 'video_effect',
            inputs: videoInput,
            outputs: videoOutput,
            options: { /* video params */ }
        };

        const audioFilter: ComplexFilter = {
            filter: 'audio_effect',
            inputs: audioInput,
            outputs: audioOutput,
            options: { /* audio params */ }
        };

        return [videoFilter, audioFilter];
    });
}
```

## Важные правила

1. **Всегда обновляй `currentVideoStream`** - `getNewVideoStream()` автоматически делает это
2. **Не забывай про аудио** - если эффект влияет на аудио, используй `getNewAudioStream()`
3. **Валидируй входные параметры** в начале метода
4. **Используй логирование** для отладки: `log('method_name started')`
5. **Оборачивай в try-catch** для сложных вычислений
6. **Документируй параметры и возвращаемые значения** в комментариях
7. **Для concat используй только мастер пайплайны** (`isMaster: true`)
8. **При работе с размерами** используй `this.width`, `this.height`, `this.targetWidth`, `this.targetHeight`

## Примеры из кодовой базы

### makeItRed() - простая цепочка

- Изолирует красный канал через `lutrgb`
- Конвертирует в grayscale через `lutyuv`

### rotate() - сложный эффект

- Split исходного потока на фон и слой для поворота
- Обработка фона (scale + setsar)
- Обработка слоя (scale + rotate)
- Overlay результата

### concat() - соединение пайплайнов

- Перелабелирование потоков
- Добавление inputs
- Создание concat фильтра для соединения

## Отладка

Используй переменные окружения для логирования:

- `ENABLE_START=true` - логирование команд FFmpeg
- `ENABLE_PROGRESS=true` - прогресс выполнения
- `ENABLE_STDERR=true` - stderr от FFmpeg

## Рекомендации по интеграционному тестированию эффектов

- Каждый эффект должен иметь интеграционный тест, который:
  - Использует реальный видеофайл (prepareVideo/prepareMultipleVideos).
  - Применяет эффект(ы) через VideoPipeline и run().
  - Проверяет результат: файл создан, длительность соответствует ожиданиям (getVideoDuration), ошибки выбрасываются корректно.
  - Для каждого теста использовать уникальный output-файл (например, `trim-smoke.mp4`, `trim-edge.mp4`).
  - Покрывать edge-cases, error-cases, чейнинг эффектов.

### Пример интеграционного теста

```ts
const output = path.join(basePath, 'trim-smoke.mp4');
if (existsSync(output)) unlinkSync(output);
const file = await prepareVideo();
const pipeline = new VideoPipeline({width: 720, height: 1280});
await pipeline.init(file);
pipeline.trimVideo(1, 4);
await pipeline.run(output);
if (!existsSync(output)) throw new Error('Output file was not created');
const duration = await getVideoDuration(output);
if (duration < 2.8 || duration > 3.3)
  throw new Error(`Duration not in expected range: ${duration}`);
```

### Пример проверки ошибки

```ts
let errorCaught = false;
try {
  pipeline.trimVideo(-1, 5);
} catch (e) {
  errorCaught = true;
}
if (!errorCaught) throw new Error('Expected error for start<0');
```

- Все эффекты должны поддерживать чейнинг (возвращать this), и это должно быть покрыто интеграционными тестами.
- В эффектах всегда выбрасывать осмысленные ошибки при некорректных параметрах (и покрывать это тестами).
- В тестах и эффектах использовать логирование ключевых этапов (start, finish, параметры), чтобы упростить отладку пайплайна.
