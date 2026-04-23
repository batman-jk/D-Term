import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { client, hasDatabaseConfig } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  const dbClient = client;
  if (!hasDatabaseConfig() || !dbClient) {
    const data = HealthCheckResponse.parse({ status: "degraded" });
    res.status(503).json(data);
    return;
  }

  try {
    await dbClient`select 1`;
    const data = HealthCheckResponse.parse({ status: "ok" });
    res.json(data);
  } catch {
    const data = HealthCheckResponse.parse({ status: "degraded" });
    res.status(503).json(data);
  }
});

export default router;
