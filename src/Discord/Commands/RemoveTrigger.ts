import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { deleteTrigger } from "../../Database/Controllers/triggerController";
import { SlashCommand } from "../../types";


export const command: SlashCommand = {
	name: "rmtrigger",
	data: new SlashCommandBuilder()
		.setName("rmtrigger")
		.setDescription("Reduce the knowlege of Marmite")
		.addStringOption(option => 
			option
				.setName("trigger")
				.setDescription("The phrase that will be forget by Marmite")
				.setRequired(true)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) => 
	{
		await interaction.deferReply();
		let trigger = interaction.options.get("trigger")?.value as string;
		let deletedTrigger = await deleteTrigger(interaction.guildId as string, trigger);
		if(deletedTrigger.error)
		{
			await interaction.editReply(`:x: Something went wrong on the trigger deletion !`);
		}
		else if(deletedTrigger.trigger == null)
		{
			await interaction.editReply(`:x: There is no trigger called **${trigger}** !`);
		}
		else
		{
			await interaction.editReply(`:put_litter_in_its_place: Trigger **${trigger}** successfully deleted !`);
		}
	}
}