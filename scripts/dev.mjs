import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

// wrangler dev rewrites every host to the first route (mydaily.irish),
// so de.localhost never reaches the worker. Deploy still uses wrangler.jsonc.
// ponytail: regex drops the routes array; a routes shape this doesn't match
// should fail the includes() check below rather than silently keep rewriting.
const config = readFileSync("wrangler.jsonc", "utf8").replace(
  /"routes"\s*:\s*\[[\s\S]*?\],?\n/,
  "",
);
if (config.includes('"routes"')) {
  console.error("dev config still has routes; de.localhost would show the Irish quiz");
  process.exit(1);
}

writeFileSync("wrangler.dev.jsonc", config);

const css = spawn(
  "node_modules/.bin/tailwindcss",
  ["-i", "./src/styles.css", "-o", "./public/tailwind.css", "--watch"],
  { stdio: "inherit" },
);

const child = spawn(
  process.execPath,
  ["node_modules/wrangler/bin/wrangler.js", "dev", "--config", "wrangler.dev.jsonc"],
  { stdio: "inherit" },
);
child.on("exit", (code, signal) => {
  css.kill();
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
