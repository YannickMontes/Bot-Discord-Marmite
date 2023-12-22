import { CommandInteraction, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";


export const command: SlashCommand = {
	name: "clear",
	restricted: true,
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Clear messages from the current channel. Messages older than 2 weeks are ignored.")
		.addNumberOption(option => 
			option
			.setName("number")
			.setDescription("Number of messages to clear")
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(50))
		.addBooleanOption(option => 
			option
			.setName("silent")
			.setDescription("Print nothing when done. Default: false")
			.setRequired(false)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) =>
	{
		const silentOption = interaction.options.get("silent");
		let isSilent: boolean = silentOption ? silentOption.value as boolean: false;
		await interaction.deferReply({ephemeral: isSilent});
		const nbMsgsToClearOption = interaction.options.get("number", true);
		const nbToDelete: number = nbMsgsToClearOption ? nbMsgsToClearOption?.value as number : 1;
		try
		{
			await (interaction.channel as GuildTextBasedChannel).bulkDelete(nbToDelete);
			await interaction.editReply({content: `Successfully cleared **${nbToDelete}** messages :tada: !`});
		}
		catch(error)
		{
			console.log(error);
		}
	}
}