import fs from "node:fs";

const swaggerRequest = await fetch(
  "https://api.chaster.app/api/swagger-ui-init.js",
);

const swaggerUiJsCode = await swaggerRequest.text();

const start = swaggerUiJsCode.search(/let options = {/);
const end = swaggerUiJsCode.search(/};/);

const specCode = swaggerUiJsCode.slice(
  start + "let options =".length,
  end + "}".length,
);

if (!fs.existsSync("/tmp/chaster")) {
  fs.mkdirSync("/tmp/chaster");
}

fs.writeFileSync(
  "/tmp/chaster/openapi.json",
  JSON.stringify(JSON.parse(specCode)["swaggerDoc"]),
);

export {};
