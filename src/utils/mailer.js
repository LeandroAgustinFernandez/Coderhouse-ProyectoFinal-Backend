import nodemailer from "nodemailer";
import config from "../config/config.js";

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: "leandroa.fernandez@gmail.com",
    pass: config.emailApp,
  },
});

export default transport