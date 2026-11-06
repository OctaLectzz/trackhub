import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

import idMessages from "../messages/id.json";
import enMessages from "../messages/en.json";

const messagesMap = {
  id: idMessages,
  en: enMessages,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: messagesMap[locale as "id" | "en"],
  };
});
