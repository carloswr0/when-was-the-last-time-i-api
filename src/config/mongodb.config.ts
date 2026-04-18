import mongoose from "mongoose";
import ENVIRONTMENT from "./environment.config.ts";

async function connectToMongoDB() {
  try {
    await mongoose.connect(ENVIRONTMENT.MONGO_DB_CONNECTION_STRING as string);
    console.log("Successful connection to MongoDB");
  } catch (err) {
    console.log("Error connecting to MongoDB: ", err);
    process.exit(1); // Exit the process with a failure code
  }
}

export default connectToMongoDB;