import { Hono } from "hono";
import LanguagePage from "./routes/language";
import { subscribeHandler } from "./routes/subscribe";
import { confirmHandler } from "./routes/confirm";
import { unsubscribeHandler } from "./routes/unsubscribe";
import { languages } from "./lib/languages";
import { Env, sendDailyEmails } from "./lib/email";
import { analyticsDashboard } from "./lib/analytics";
import { getHostLang, isHubHost, isLangCode, redirectUrl } from "./utils";
import HomePage from "./routes/home";
import type { SchedulerContext, SchedulerController } from "./types";
import { answerQuestionHandler, getQuestionHandler } from "./routes/question";
import { leaderboardHandler, meHandler, profileHandler } from "./routes/accounts";

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

app.get("/:langCode", (c) => {
  const langCode = c.req.param("langCode");
  if (!isLangCode(langCode)) return c.notFound();
  return c.html(<LanguagePage langCode={langCode} />);
});

app.post("/subscribe", subscribeHandler);
app.get("/confirm", confirmHandler);
app.get("/unsubscribe", unsubscribeHandler);
app.get("/api/me", meHandler);
app.put("/api/profile", profileHandler);
app.get("/api/leaderboard", leaderboardHandler);
app.get("/analytics", (c) =>
  analyticsDashboard(c, (c as unknown as { env: Env }).env),
);
app.get("/:langCode/question/:questionNumber", getQuestionHandler);
app.post("/:langCode/answer/:questionNumber", answerQuestionHandler);

export default {
  fetch: app.fetch,
  scheduled(controller: SchedulerController, env: Env, ctx: SchedulerContext) {
    ctx.waitUntil(sendDailyEmails(env, controller.scheduledTime));
  },
};
export { app };
