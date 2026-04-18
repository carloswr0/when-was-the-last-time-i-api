import nodemailer from "nodemailer";
import ENVIRONTMENT from "./environment.config.ts";

const mailerTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENVIRONTMENT.MAIL_EMAIL,
    pass: ENVIRONTMENT.MAIL_PASSWORD,
  },
});

export default mailerTransporter;