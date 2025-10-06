import express from "express";
import { getAuditLogs } from "./auditLog.controller.js";

const router = express.Router();

router.get("/", getAuditLogs);

export default router;