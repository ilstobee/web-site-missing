# Инструкция: общая база команд и сфер для всех пользователей

## Что это даёт
- Все пользователи видят одни и те же команды и сферы в реальном времени.
- Любой зарегистрированный пользователь может добавить команду или сферу — она появляется у всех после одобрения администратором.
- Профили, вход и пароли хранятся в Firebase.

## Что уже готово
Весь код написан (`src/firebase.ts`, `src/store.tsx`). Пока Firebase не подключён, сайт работает в демо-режиме: данные хранятся только в localStorage одного браузера и никому больше не видны.

## Шаг 1. Создать проект Firebase
1. Открой https://console.firebase.google.com
2. **Add project** → название (например, `web-site-missing`) → **Create**.

## Шаг 2. Включить вход
1. **Build → Authentication → Get started**.
2. **Sign-in method → Email/Password** → включи → **Save**.
3. **Sign-in method → Phone** → включи → **Save**.

## Шаг 3. Создать базу Firestore
1. **Build → Firestore Database → Create database**.
2. Регион: `europe-central2` (или `europe-west3`).
3. Режим: **Production mode** → **Create**.

## Шаг 4. Создать Storage (для обложек команд)
1. **Build → Storage → Get started** → **Create**.

## Шаг 5. Зарегистрировать веб-приложение и взять ключи
1. ⚙ **Project settings → General → Your apps → Web app (`</>`)** → **Register app**.
2. Скопируй значения из блока **SDK setup and configuration**:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## Шаг 6. Прописать правила Firestore
1. **Build → Firestore Database → Rules**.
2. Вставь содержимое файла `firestore.rules` (лежит в репозитории).
3. В файле **замени `PASTE_ADMIN_UID_HERE`** на свой UID (см. Шаг 7).
4. **Publish**.

## Шаг 7. Получить свой UID (для админ-панели)
1. Зарегистрируйся на сайте (или войди через Firebase).
2. **Authentication → Users** → найди свой аккаунт → скопируй **UID**.
3. Вставь его:
   - в `firestore.rules` вместо `PASTE_ADMIN_UID_HERE`;
   - в `.env` как `VITE_FIREBASE_ADMIN_UID`.

## Шаг 8. Прописать правила Storage
1. **Build → Storage → Rules**.
2. Вставь содержимое файла `storage.rules` → **Publish**.

## Шаг 9. Заполнить `.env`
Скопируй `.env.example` в `.env` и подставь свои значения:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_ADMIN_UID=...     # твой UID из Шага 7
```

## Шаг 10. Деплой (сборка на GitHub)
`.env` в Git не хранится, поэтому передай его как секрет:
1. GitHub → **Settings → Secrets and variables → Actions → New repository secret**.
2. **Name:** `ENV_FILE`
3. **Value:** содержимое твоего `.env` (без комментариев, построчно).
4. Запушь изменения в `main` — CI сам соберёт и задеплоит сайт.

> Деплой сработает и без секрета — сайт просто останется в демо-режиме (локальные данные).

## Проверка
1. Открой сайт в двух разных браузерах или устройствах.
2. В одном добавь команду или сферу — она попадёт на модерацию.
3. В админ-панели одобри её.
4. Она появится у всех пользователей в реальном времени.