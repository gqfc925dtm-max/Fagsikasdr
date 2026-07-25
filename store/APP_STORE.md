# ОТТИСК → App Store

## Что уже готово в репозитории

- Capacitor-конфиг (`capacitor.config.json`)
- Сборка веб-ассетов в `www/` (`npm run build:www`)
- Честный continue без фейковой рекламы
- `privacy.html` и `support.html` для App Store Connect
- Метаданные: `store/metadata.ru.txt`

## Что нужно у тебя на Mac

1. [Apple Developer Program](https://developer.apple.com/programs/) ($99/год)
2. Xcode (последний стабильный)
3. CocoaPods или встроенный SPM от Capacitor 7

## Сборка iOS-проекта

```bash
cd Fagsikasdr
npm install
npm run build:www
npx cap add ios          # один раз
npx cap sync ios
npx cap open ios
```

В Xcode:

1. Signing & Capabilities → твоя Team
2. Bundle ID: `com.amelin.ottisk` (или свой уникальный)
3. Deployment target: iOS 15+
4. Добавь иконку 1024×1024 в `Assets.xcassets/AppIcon`
5. Product → Archive → Distribute App → App Store Connect

## App Store Connect

Обязательные ссылки:

- Privacy Policy URL: `https://gqfc925dtm-max.github.io/Fagsikasdr/privacy.html`
- Support URL: `https://gqfc925dtm-max.github.io/Fagsikasdr/support.html`

Заполни:

- Название: ОТТИСК
- Подзаголовок: Живёт только под пальцем
- Категория: Games → Casual / Action
- Возраст: 4+
- Скриншоты iPhone 6.7" и 6.1"
- App Privacy: Data Not Collected (пока нет аналитики/рекламы)

## Монетизация сейчас

- 1 бесплатный continue за забег
- Дополнительный continue за следы (внутриигровая валюта)
- Косметика за следы / рекорд

Позже можно добавить StoreKit IAP (`ottisk_marks_60`) — код игры уже разделён так, чтобы покупки подключить без переписывания ядра.

## TestFlight

1. Archive → Upload
2. Добавь себя и 5–20 тестеров
3. Проверь: первый запуск, фон/пауза, continue, shop, share
4. Submit for Review

## Частые причины отказа

- Фейковая реклама / фейковые IAP
- Битые Privacy/Support URL
- Крэш на запуске
- «Минимальная функциональность» — у ОТТИСК полноценный геймплей, это ок
- Неверные App Privacy labels
