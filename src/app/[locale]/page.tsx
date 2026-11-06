import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageSearch, FileSpreadsheet, ExternalLink } from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {t("badge")}
          </Badge>
          <span className="text-xs text-muted-foreground">{t("techStack")}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PackageSearch className="size-5" />
            </div>
            <CardTitle className="mt-3 text-base">{t("card1Title")}</CardTitle>
            <CardDescription className="text-xs">
              {t("card1Desc")}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <ExternalLink className="size-5" />
            </div>
            <CardTitle className="mt-3 text-base">{t("card2Title")}</CardTitle>
            <CardDescription className="text-xs">
              {t("card2Desc")}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <FileSpreadsheet className="size-5" />
            </div>
            <CardTitle className="mt-3 text-base">{t("card3Title")}</CardTitle>
            <CardDescription className="text-xs">
              {t("card3Desc")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
