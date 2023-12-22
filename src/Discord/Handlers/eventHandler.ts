import fs from "fs";
import { BotEvent } from "../../types.js";
import client from "../client.js";

let eventDir = __dirname + "/../Events";

const eventFiles = fs.readdirSync(eventDir).filter(file => file.endsWith('.js'));
for(const eventFile of eventFiles)
{
	const event: BotEvent = require(`${eventDir}/${eventFile}`).default;
	if(event.once)
	{
		client.once(event.name, event.execute);
	}
	else
	{
		client.on(event.name, event.execute);
	}
	console.log(`Init Event: ${event.name} !`)
}