import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { SlashCommand } from '../types';

const client = new Client({ 
	partials: [
		Partials.Message, 
		Partials.Channel, 
		Partials.Reaction,
	], 
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessageReactions
	] 
});

client.slashCommands = new Collection<string, SlashCommand>();

if(!process.env.DISCORD_TOKEN)
	console.log("Please provide a discord app token in your .env file.");
else
	client.login(process.env.DISCORD_TOKEN);

export default client;