import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

config();

export default defineConfig({
  datasource: {
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
