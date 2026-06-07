import { readFile, writeFile } from "node:fs/promises";

const outputConfigPath = new URL("../.vercel/output/config.json", import.meta.url);

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
