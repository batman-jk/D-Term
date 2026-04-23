import app from "./app";
import { logger } from "./lib/logger";

const port = Number(process.env["PORT"] || "8080");

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");
});

server.on("error", (err) => {
  logger.error({ err, port }, "Error listening on port");
  process.exitCode = 1;
});
