import express from "express";
import { fetchDeviceHistory } from "./deviceHistorycontroller.js";
import { validateDeviceId } from "./deviceHistorymiddleware.js";

const router = express.Router();

router.get("/:deviceId", validateDeviceId, fetchDeviceHistory);

export default router;
