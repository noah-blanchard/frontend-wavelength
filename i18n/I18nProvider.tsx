"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { initI18n } from "./init";

const i18n = initI18n();

type I18nProviderProps = {
  children: React.ReactNode;
};

const I18nProvider = ({ children }: I18nProviderProps) => {
  useEffect(() => {
    const updateLang = (lang: string) => {
      if (typeof document === "undefined") {
        return;
      }
      document.documentElement.lang = lang || "en";
    };

    updateLang(i18n.language);
    i18n.on("languageChanged", updateLang);

    return () => {
      i18n.off("languageChanged", updateLang);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18nProvider;
