# Figma Icon Export

🚀 Автоматический экспорт иконок из Figma в SVG через GitHub Actions.

## 📋 Описание

Этот проект автоматически экспортирует иконки из страницы "Icons" в Figma и создает Pull Request при обнаружении изменений.

## 🛠 Технические требования

- **Node.js 20+**
- **Figma API токен**
- **GitHub Actions**

## ⚙️ Настройка

### 1. Получение Figma API токена

1. Откройте [Figma Settings](https://www.figma.com/settings)
2. Перейдите в раздел "Personal access tokens"
3. Создайте новый токен
4. Скопируйте токен

### 2. Настройка GitHub Secrets

В настройках репозитория GitHub добавьте следующие secrets:

- `FIGMA_FILE_ID` - ID файла Figma (из URL: `https://www.figma.com/file/FILE_ID/...`)
- `FIGMA_ACCESS_TOKEN` - токен доступа к Figma API

### 3. Настройка Figma

1. Создайте страницу с названием **"Icons"** в вашем файле Figma
2. Разместите иконки на этой странице
3. Имена узлов будут использованы как имена файлов SVG

## 📁 Структура проекта

```
├── .github/workflows/
│   └── figma-export.yml     # GitHub Actions workflow
├── scripts/
│   └── figma-export-mvp.mjs # Скрипт экспорта
├── src/
│   └── icons/               # Экспортированные SVG иконки
├── package.json
└── README.md
```

## 🚀 Использование

### Автоматический режим

GitHub Actions автоматически:
- Запускается каждый день в 9:00 UTC
- Экспортирует иконки из Figma
- Создает Pull Request при обнаружении изменений

### Ручной запуск

1. Перейдите в раздел "Actions" в GitHub
2. Выберите workflow "Figma Icons Export"
3. Нажмите "Run workflow"

### Локальный запуск

```bash
# Установка зависимостей
npm install

# Экспорт иконок (требует переменные окружения)
FIGMA_FILE_ID=your_file_id FIGMA_ACCESS_TOKEN=your_token npm run export
```

## 📝 Логика работы

1. **Поиск страницы**: Скрипт ищет страницу с названием "Icons"
2. **Поиск узлов**: Рекурсивно обходит все узлы на странице
3. **Экспорт**: Экспортирует каждый узел как SVG
4. **Сохранение**: Сохраняет файлы в `src/icons/` с именами узлов
5. **Сравнение**: GitHub Actions сравнивает изменения
6. **PR**: Создает Pull Request при обнаружении изменений

## 🔧 Настройка

### Изменение расписания

Отредактируйте файл `.github/workflows/figma-export.yml`:

```yaml
on:
  schedule:
    - cron: '0 9 * * *'  # Каждый день в 9:00 UTC
```

### Изменение папки назначения

В файле `scripts/figma-export-mvp.mjs` измените:

```javascript
OUTPUT_DIR: path.join(__dirname, '..', 'src', 'icons'),
```

### Изменение названия страницы

В файле `scripts/figma-export-mvp.mjs` измените:

```javascript
FIGMA_PAGE_NAME: 'Icons', // Ваше название страницы
```

## 🐛 Устранение неполадок

### Ошибка "Страница не найдена"
- Убедитесь, что страница в Figma называется точно "Icons"
- Проверьте права доступа к файлу Figma

### Ошибка "HTTP 403"
- Проверьте правильность FIGMA_ACCESS_TOKEN
- Убедитесь, что токен не истек

### Ошибка "HTTP 404"
- Проверьте правильность FIGMA_FILE_ID
- Убедитесь, что файл существует и доступен

## 📄 Лицензия

MIT
