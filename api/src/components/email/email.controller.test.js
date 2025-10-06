import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";

import { sendEmail } from "./email.controller.js";
import transporter from "../../emails/emailTransporter.js";


vi.mock("../../emails/emailTransporter.js", () => ({
  default: {
    sendMail: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.post("/send-email", sendEmail);

describe("Email Controller - sendEmail", () => {
  beforeEach(() => {
    vi.restoreAllMocks(); 
  });

  it("should send an email successfully", async () => {
    transporter.sendMail.mockResolvedValueOnce({ messageId: "12345" });

    const response = await request(app)
      .post("/send-email")
      .send({
        email: "test@example.com",
        subject: "Test Email",
        htmlBody: "<p>Hello, this is a test email</p>",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Email sent successfully");
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
  });

  it("should handle email sending failures", async () => {
    transporter.sendMail.mockRejectedValueOnce(new Error("SMTP Error"));

    const response = await request(app)
      .post("/send-email")
      .send({
        email: "test@example.com",
        subject: "Test Email",
        htmlBody: "<p>Hello, this is a test email</p>",
      });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Failed to send email");
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
  });

  it("should use the correct email template when specified", async () => {
    transporter.sendMail.mockResolvedValueOnce({ messageId: "67890" });

    const response = await request(app)
      .post("/send-email")
      .send({
        email: "test@example.com",
        subject: "Account Locked",
        template: "lock_account",
        data: { account_to_lock: "lockeduser@example.com" },
      });

    expect(response.status).toBe(200);
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
  });
});

