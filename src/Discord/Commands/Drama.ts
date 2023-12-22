import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import TwitterHandlerInstance from "../../Twitter/TwitterHandler";
import { SlashCommand } from "../../types";


export const command: SlashCommand = {
	name: "drama",
	data: new SlashCommandBuilder()
		.setName("drama")
		.setDescription("Get a drama from Twitter")
		.addStringOption(option => 
			option
				.setName("trend")
				.setDescription("The best trending, or a random one")
				.addChoices({name: "Best trend", value: "best"},
				{name: "Random trend", value: "random"})
				.setRequired(true))
		.addStringOption(option => 
			option
				.setName("tweet")
				.setDescription("The best tweet from the trend, or a random one")
				.addChoices({name: "Best tweet", value: "best"},
				{name: "Random tweet", value: "random"})
				.setRequired(true)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) => 
	{
		await interaction.deferReply();
		const trendOption = interaction.options.get("trend", true).value as string;
		const tweetOption = interaction.options.get("tweet", true).value as string;

		TwitterHandlerInstance.getDrama(interaction, trendOption, tweetOption);
	}
}