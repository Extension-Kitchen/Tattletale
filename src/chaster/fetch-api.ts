import fs from "node:fs";

const swaggerUi = await fetch("https://api.chaster.app/api/swagger-ui-init.js");

const jsCode = await swaggerUi.text();

const start = jsCode.search(/let options = {/);
const end = jsCode.search(/};/);

const specCode = jsCode.slice(start + "let options =".length, end + "}".length);

if (!fs.existsSync("/tmp/chaster")) {
  fs.mkdirSync("/tmp/chaster");
}

fs.writeFileSync(
  "/tmp/chaster/openapi.json",
  JSON.stringify(JSON.parse(specCode)["swaggerDoc"]),
);

export {};
