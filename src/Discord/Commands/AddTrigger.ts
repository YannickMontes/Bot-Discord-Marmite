import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { createTrigger } from "../../Database/Controllers/triggerController";
import { SlashCommand } from "../../types";


export const command: SlashCommand = {
	name: "addtrigger",
	data: new SlashCommandBuilder()
		.setName("addtrigger")
		.setDescription("Enhance the knowlege of Marmite")
		.addStringOption(option => 
			option
				.setName("trigger")
				.setDescription("The phrase that will be checked by Marmite")
				.setRequired(true))
		.addStringOption(option => 
			option
				.setName("content")
				.setDescription("The response Marmite will say when someone say the trigger")
				.setRequired(true)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) => 
	{
		await interaction.deferReply();
		let trigger = interaction.options.get("trigger")?.value as string;
		let whatToTrigger = interaction.options.get("content")?.value as string;
		let newTrigger = await createTrigger(interaction.guildId as string, trigger, whatToTrigger);
		if(newTrigger.error)
		{
			await interaction.editReply(`:x: Something went wrong on the trigger creation !`);
		}
		else
		{
			await interaction.editReply(`:thumbsup: Trigger **${trigger}** successfully created !`);
		}
	}
}