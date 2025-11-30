import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  client: "axios",
  input: "../backend/openapi.json",
  output: "./src/api",
  useOptions: true,
  useUnionTypes: true,
  exportCore: true,
  exportServices: true,
  exportModels: true,
  exportSchemas: false,
});
