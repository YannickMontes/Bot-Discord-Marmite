import { CommandInteraction, SlashCommandBuilder, User } from "discord.js";
import { SlashCommand } from "../../types";
import { getUserMentionFromId } from "../../utils";


export const command: SlashCommand = {
	name: "kickz",
	restricted: true,
	data: new SlashCommandBuilder()
		.setName("kickz")
		.setDescription("Expulse specified user from the server.")
		.addUserOption(option => 
			option
				.setName("user")
				.setDescription("The user you want to kick.")
				.setRequired(true))
		.addStringOption(option => 
			option
				.setName("reason")
				.setDescription("Why he is kicked")
				.setRequired(false)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) =>
	{
		await interaction.deferReply();
		const userToKick: User = interaction.options.getUser("user") as User;
		const reasonOption = interaction.options.get("reason");
		const reason = reasonOption ? reasonOption.value : null;
		try
		{
			await interaction.guild?.members.kick(userToKick);
			await interaction.editReply(`User ${getUserMentionFromId(userToKick.id)} has been kicked ${reason != null ? `because *"${reason}"*` : ''}.\nSee ya buddy ! :door:`);
		}
		catch(error)
		{
			console.log(error);
		}
	}
}