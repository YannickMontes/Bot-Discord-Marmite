import { REST, Routes } from "discord.js";
import fs from "fs";
import { SlashCommand } from "../../types.js";
import client from "../client.js";

let commandDir = __dirname + "/../Commands";
let commandJson = [];
let allCommandNames = [];

const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));
for(const commandFile of commandFiles)
{
	const command: SlashCommand = require(`${commandDir}/${commandFile}`).command;
	client.slashCommands.set(command.name, command);
	commandJson.push(command.data.toJSON());
	allCommandNames.push(command.name);
}

console.log("All slashs commands:");
console.log(allCommandNames);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
console.log("Reloading slash commands...");

rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {body: commandJson})
		.then(() => console.log("Slash commands reloaded."))
		.catch((error)  => console.log("Error while puting slash commands: \n", error));

// rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_SERVER_ID), {body: commandJson})
// 		.then(() => console.log("Slash commands reloaded test server."))
// 		.catch((error)  => console.log("Error while puting slash commands test server: \n", error));