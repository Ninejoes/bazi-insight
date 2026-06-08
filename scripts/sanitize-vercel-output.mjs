import { readdir, readFile, writeFile } from "node:fs/promises";

const outputConfigPath = new URL("../.vercel/output/config.json", import.meta.url);
const functionsPath = new URL("../.vercel/output/functions/", import.meta.url);

const config = JSON.parse(await readFile(outputConfigPath, "utf8"));

// Vercel's Build Output API v3 config schema is strict. Nitro includes display
// metadata that can make the deploy fail after a successful build.
if (config.framework && typeof config.framework === "object") {
  delete config.framework.name;
  if (!Object.keys(config.framework).length) {
    delete config.framework;
  }
}

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
