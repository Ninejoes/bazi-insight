import { readdir, readFile, writeFile } from "node:fs/promises";

const outputConfigPath = new URL("../.vercel/output/config.json", import.meta.url);
const functionsPath = new URL("../.vercel/output/functions/", import.meta.url);

const config = JSON.parse(await readFile(outputConfigPath, "utf8"));

// Vercel's Build Output API v3 config schema is strict. Nitro includes display
// metadata that can make Git-connected deploys fail after a successful build.
delete config.framework;

if (config.overrides && !Object.keys(config.overrides).length) {
  delete config.overrides;
}

const serverRoutes = [
  { src: "/sitemap\\.xml", dest: "/__server" },
  { src: "/sitemap-[\\w-]+\\.xml", dest: "/__server" },
  { src: "/robots\\.txt", dest: "/__server" },
];

const routes = Array.isArray(config.routes) ? config.routes : [];
config.routes = [
  ...serverRoutes.filter(
    (route) => !routes.some((existing) => existing.src === route.src && existing.dest === route.dest),
  ),
  ...routes,
];

await writeFile(outputConfigPath, `${JSON.stringify(config, null, 2)}\n`);

for (const entry of await readdir(functionsPath, { withFileTypes: true })) {
  if (!entry.isDirectory() || !entry.name.endsWith(".func")) {
    continue;
  }

  const functionConfigPath = new URL(`${entry.name}/.vc-config.json`, functionsPath);
  const functionConfig = JSON.parse(await readFile(functionConfigPath, "utf8"));

  if (functionConfig.runtime === "nodejs24.x") {
    functionConfig.runtime = "nodejs22.x";
  }

  await writeFile(functionConfigPath, `${JSON.stringify(functionConfig, null, 2)}\n`);
}
