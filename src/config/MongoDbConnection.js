// ? Mongoose
import mongoose from "mongoose";
import config from "./config.js";

export default class MongoDbConnection {
  static #instance;

  constructor() {
    mongoose.connect(config.mongoUrl);
  }

  static getConnection() {
    try {
      if (this.#instance) {
        return this.#instance;
      }
      this.#instance = new MongoDbConnection();
    } catch (error) {
      console.log(error.message);
    }
  }
}