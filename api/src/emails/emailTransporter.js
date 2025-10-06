import nodemailer from "nodemailer";
import config from "../configs/app.config.js";

const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
        user: config.email,
        pass: config.app_password
    },
});

export default transporter;

