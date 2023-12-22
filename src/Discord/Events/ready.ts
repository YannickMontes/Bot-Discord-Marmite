import { BotEvent } from "../../types";
import { Client, Events } from "discord.js";
import { setupStatus } from "../status";
import TwitterHandlerInstance from "../../Twitter/TwitterHandler";

const event: BotEvent = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client) {
		console.log((`Client logged in as ${client.user?.tag}`));
		setupStatus(client);
		TwitterHandlerInstance.init(client);
	},
}

export default event;