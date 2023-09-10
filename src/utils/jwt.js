import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const generateToken = (user) => {
  const token = jwt.sign({ user }, config.jwtPrivate, { expiresIn: '365d' });
  return token;
};