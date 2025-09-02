import { config } from "dotenv";
import { createApp } from "./app";

config();

const app = createApp();

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});


