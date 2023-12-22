import { CommandInteraction, SlashCommandBuilder, User } from "discord.js";
import { SlashCommand } from "../../types";
import { getUserMentionFromId } from "../../utils";


export const command: SlashCommand = {
	name: "banz",
	restricted: true,
	data: new SlashCommandBuilder()
		.setName("banz")
		.setDescription("Banish someone from the server.")
		.addUserOption(option => 
			option
				.setName("user")
				.setDescription("The one who will be set aside.")
				.setRequired(true))
		.addStringOption(option => 
			option
				.setName("reason")
				.setDescription("Why he is banned")
				.setRequired(false)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) => 	
	{
		await interaction.deferReply();
		const userToBan: User = interaction.options.getUser("user") as User;
		const reasonOption = interaction.options.get("reason");
		const reason = reasonOption ? reasonOption.value : null;
		try
		{
			await interaction.guild?.members.ban(userToBan, {reason: (reason ? reason as string : "None")});
			await interaction.editReply(`User ${getUserMentionFromId(userToBan.id)} has been banned ${reason != null ? `because *"${reason}"*` : ''}.\nSee ya buddy ! :door:`);
		}
		catch(error)
		{
			console.log(error);
		}
	}
}