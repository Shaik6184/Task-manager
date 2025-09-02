import serverless from "serverless-http";
import { createApp } from "../backend/src/app";
import { config } from "dotenv";

// Load env when running in Vercel function
config();

// Ensure Prisma client re-use across invocations
const app = createApp();
export default serverless(app);


