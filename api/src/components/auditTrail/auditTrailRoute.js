import express from "express";
import { createAuditTrail, getAuditTrails } from "./auditTrailController.js";

const router = express.Router();

router.get("/", getAuditTrails);


router.post("/", createAuditTrail);

export default router;

