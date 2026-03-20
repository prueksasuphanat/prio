import { createI18n } from "vue-i18n";
import th from "./locales/th.json";
import en from "./locales/en.json";

const i18n = createI18n({
  legacy: false,
  locale: "th",
  fallbackLocale: "en",
  messages: { th, en },
});

export default i18n;
