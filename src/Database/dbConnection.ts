import mongoose, { mongo } from "mongoose";
import { updateAllTriggers } from "./Controllers/triggerController";

console.log("Connect to DB...");
mongoose.set('strictQuery', false);
let DBConnection = mongoose.connect(process.env.DB_ADDRESS)
		.then(() => console.log("Connected to DB !"))
		.catch(error => console.log(error));

export default DBConnection;


updateAllTriggers("519166277344952340");
