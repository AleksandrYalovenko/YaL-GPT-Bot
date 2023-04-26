# Указываем базовый образ
FROM node:16-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

RUN npm ci

# Копируем исходный код приложения
COPY . .

# Опционально: устанавливаем любые дополнительные зависимости, необходимые для работы с Telegram ботом

# Опционально: указываем переменные окружения, которые могут потребоваться для работы с Telegram ботом
# ENV TELEGRAM_API_TOKEN=<ваш токен>

# Опционально: открываем порт, если необходимо для работы с Telegram ботом
ENV PORT=5000
EXPOSE $PORT

# Запускаем приложение
CMD ["npm", "start"]