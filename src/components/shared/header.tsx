'use client';

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Globe } from "lucide-react";

export function Header() {
  const t = useTranslations("common");
  const navT = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === "id" ? "en" : "id";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Package className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground">
                {t("appName")}
              </span>
              <span className="hidden text-xs text-muted-foreground sm:inline-block">
                {t("tagline")}
              </span>
            </div>
          </Link>
          <Badge variant="secondary" className="ml-2 font-mono text-[10px] tracking-wide">
            {t("version")}
          </Badge>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLocale}
            className="flex items-center gap-1.5 text-xs font-medium"
            title={t("language")}
          >
            <Globe className="size-3.5" />
            <span>{locale.toUpperCase()}</span>
          </Button>

          <a
            href="https://github.com/OctaLectzz/trackhub"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={navT("github")}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <svg
              className="size-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
