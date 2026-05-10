import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

// Tải biến môi trường từ file .env trước khi đọc config
config();

export default defineConfig({
  datasource: {
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
