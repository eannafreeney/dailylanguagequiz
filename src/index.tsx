import { Hono } from "hono";
import LanguagePage from "./routes/language";
import SeoPage from "./components/SeoPage";
import { subscribeHandler } from "./routes/subscribe";
import { confirmHandler } from "./routes/confirm";
import { unsubscribeHandler } from "./routes/unsubscribe";
import { languages } from "./lib/languages";
import { languageConfig } from "./config/language-config";
import { Env, sendDailyEmails } from "./lib/email";
import { sendDailySocialPosts } from "./lib/social";
import { socialImageHandler } from "./routes/social-image";
import { analyticsDashboard } from "./lib/analytics";
import { getHostLang, isHubHost, isLangCode, redirectUrl } from "./utils";
import HomePage from "./routes/home";
import type { LangCode, SchedulerContext, SchedulerController } from "./types";
import { answerQuestionHandler, getQuestionHandler } from "./routes/question";
import { hvAnswer, hvEntrypoint, hvHome, hvQuestion } from "./routes/hv";

const app = new Hono();

app.use("*", async (c, next) => {
  const destination = redirectUrl(c.req.url);
  if (destination) return c.redirect(destination, 301);
  const hostLang = getHostLang(c);
  if (hostLang) {
    const firstSegment = c.req.path.split("/")[1];
    if (isLangCode(firstSegment) && firstSegment !== hostLang)
      return c.notFound();
  }
  await next();
});

app.get("/", (c) => {
  if (isHubHost(c)) return c.html(<HomePage />);
  const language = languages.find((item) => item.langCode === getHostLang(c));
  return language ? c.html(<LanguagePage {...language} />) : c.notFound();
});

app.get("/social-media/:langCode/:date/:slide{[^/]+[.]png}", socialImageHandler);

app.get("/sitemap.xml", (c) => {
  const hostLang = getHostLang(c);
  const language = languages.find((item) => item.langCode === hostLang);
  const baseUrl = language?.siteUrl;
  if (!baseUrl) return c.notFound();
  const paths = ["/", ...(hostLang && isLangCode(hostLang) ? languageConfig[hostLang].seo?.pages.map((page) => `/${page.slug}`) ?? [] : [])];
  const urls = paths.map((path) => `<url><loc>${baseUrl}${path}</loc></url>`).join("");
  return c.body(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>` ,
    200,
    { "Content-Type": "application/xml; charset=UTF-8" },
  );
});

app.get("/robots.txt", (c) => {
  const language = languages.find((item) => item.langCode === getHostLang(c));
  if (!language?.siteUrl) return c.notFound();
  return c.text(
    `User-agent: *\nAllow: /\nDisallow: /subscribe\nDisallow: /confirm\nDisallow: /unsubscribe\nDisallow: /analytics\nDisallow: /*/question/\nSitemap: ${language.siteUrl}/sitemap.xml\n`,
    200,
    { "Content-Type": "text/plain; charset=UTF-8" },
  );
});
app.get("/hv", hvEntrypoint);
app.get("/hv/home", hvHome);
app.get("/hv/:langCode/question/:questionNumber", hvQuestion);
app.post("/hv/:langCode/answer/:questionNumber", hvAnswer);

app.get("/:slug", (c) => {
  const slug = c.req.param("slug");
  const pathLanguage = languages.find((item) => item.langCode === slug);
  if (pathLanguage) return c.html(<LanguagePage langCode={pathLanguage.langCode as LangCode} />);

  const hostLang = getHostLang(c);
  if (!hostLang || !isLangCode(hostLang)) return c.notFound();
  const page = languageConfig[hostLang].seo?.pages.find((item) => item.slug === slug);
  return page ? c.html(<SeoPage langCode={hostLang} page={page} />) : c.notFound();
});

app.post("/subscribe", subscribeHandler);
app.get("/confirm", confirmHandler);
app.get("/unsubscribe", unsubscribeHandler);
app.get("/analytics", (c) =>
  analyticsDashboard(c, (c as unknown as { env: Env }).env),
);
app.get("/:langCode/question/:questionNumber", getQuestionHandler);
app.post("/:langCode/answer/:questionNumber", answerQuestionHandler);

export default {
  fetch: app.fetch,
  scheduled(controller: SchedulerController, env: Env, ctx: SchedulerContext) {
    ctx.waitUntil(sendDailyEmails(env, controller.scheduledTime));
    ctx.waitUntil(sendDailySocialPosts(env, controller.scheduledTime));
  },
};
export { app };
