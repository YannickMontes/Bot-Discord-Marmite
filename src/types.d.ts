import { CommandInteraction, Interaction, SlashCommandBuilder } from "discord.js"

export interface BotEvent 
{
	name: string,
	once?: boolean | false,
	async execute: (... args) => void
}

export interface SlashCommand
{
	name: string,
	data: SlashCommandBuilder,
	async execute: (interaction: CommandInteraction) => Promise<void>
	restricted?: boolean
}

declare module "discord.js"
{
	export interface Client
	{
		slashCommands: Collection<string, SlashCommand>
	}
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CLIENT_ID: string,
			DISCORD_TOKEN: string,
			RESTRICTED_MODE: number,
			ALL_TIME_BANWORDS: string,
			DB_ADDRESS: string,
			TWITTER_API_KEY: string, 
			TWITTER_API_SECRET_KEY: string,
			TWITTER_ACCESS_TOKEN: string,
			TWITTER_ACCESS_TOKEN_SECRET: string,
			TWITTER_NCH_ID: string,
			TWITTER_NCA_ID: string,
			NCH_CHANNEL:string, 
			NCA_CHANNEL:string,
			WOEID_FRANCE: string,
			STATUS_TIMER: number,
			WELCOME_CHANNEL_NAME: string,
			OWNER_ROLE_NAME: string,
			MEMBER_ROLE: string,
			PAIN_CHOC_ROLE: string,
			CHOCOLATINE_ROLE: string
		}
	}
}