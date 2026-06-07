import { configureOpenAPI } from "@/lib/configure-open-api";
import { createApp } from "@/lib/create-app";

const app = createApp().basePath("/api/v1");

configureOpenAPI(app);

export default app;
