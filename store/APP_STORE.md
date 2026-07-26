# ОТТИСК → App Store

## Если у тебя Windows

Читай сначала: **[WINDOWS.md](./WINDOWS.md)**

На Windows нет Xcode. Собираем iOS через облачный Mac (Codemagic) или чужой/арендованный Mac.

## Что уже готово в репозитории

- Capacitor + папка `ios/`
- `codemagic.yaml` для облачной сборки
- Честный continue без фейковой рекламы
- `privacy.html` и `support.html`
- Метаданные: `store/metadata.ru.txt`

## Обязательно у любого разработчика

1. [Apple Developer Program](https://developer.apple.com/programs/) — $99/год  
2. Приложение в App Store Connect  
3. Bundle ID: `com.amelin.ottisk`

## Путь A — Windows + Codemagic (рекомендуется)

1. Зайди на [codemagic.io](https://codemagic.io) через GitHub  
2. Подключи `Fagsikasdr`  
3. Настрой code signing и App Store Connect API key  
4. Запусти workflow **ios-app-store**  
5. Проверь TestFlight на iPhone  

Подробности: [WINDOWS.md](./WINDOWS.md)

## Путь B — есть Mac

```bash
npm install
npm run build:www
npx cap sync ios
npx cap open ios
```

В Xcode: Signing → Archive → Distribute → App Store Connect.

## App Store Connect

Обязательные ссылки:

- Privacy Policy: `https://gqfc925dtm-max.github.io/Fagsikasdr/privacy.html`
- Support URL: `https://gqfc925dtm-max.github.io/Fagsikasdr/support.html`

Заполни:

- Название: ОТТИСК
- Подзаголовок: Живёт только под пальцем
- Категория: Games → Casual
- Возраст: 4+
- Скриншоты iPhone 6.7" и 6.1"
- App Privacy: Data Not Collected (пока нет аналитики/рекламы)

Текст для карточки: `store/metadata.ru.txt`

## Монетизация

- 1 бесплатный continue за забег
- Доп. continue за следы
- Косметика за следы / рекорд
- Кнопка `Донат` в меню → tip packs + пак следов
- `OttiskNative.purchase('ottisk_marks_60')` — пак следов
- `OttiskNative.purchase('ottisk_submarine')` — подводный корабль · 99 ₽ (пушки · 3 жизни)
- `ottisk_tip_small` / `ottisk_tip_mid` / `ottisk_tip_big` — донаты с благодарностью в следах

### StoreKit позже

1. App Store Connect → Consumable / Non-Consumable:
   - `ottisk_marks_60` (Consumable)
   - `ottisk_submarine` (Non-Consumable · 99 ₽) — герой «корабль»
   - `ottisk_tip_small`
   - `ottisk_tip_mid`
   - `ottisk_tip_big`
2. Подключи плагин покупок в iOS-оболочке
3. Проброс в `Capacitor.Plugins.OttiskIAP`

## TestFlight

1. Залей билд (Codemagic или Xcode)
2. Добавь себя тестером
3. Проверь: старт, пауза, continue, shop, share
4. Submit for Review

## Частые отказы

- Фейковая реклама / фейковые IAP
- Битые Privacy/Support URL
- Крэш на запуске
- Неверные App Privacy labels
