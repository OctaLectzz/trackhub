'use client';

import * as React from "react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="mt-auto border-t border-border/40 bg-card/40 py-6 text-center text-xs text-muted-foreground">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {t("appName")}. {t("tagline")}.
        </p>
        <p className="font-mono text-[11px]">
          Created with Next.js 15+ &bull; Tailwind CSS v4 &bull; shadcn/ui
        </p>
      </div>
    </footer>
  );
}
