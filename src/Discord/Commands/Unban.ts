import { CommandInteraction, SlashCommandBuilder, User } from "discord.js";
import { SlashCommand } from "../../types";
import { getUserMentionFromId } from "../../utils";


export const command: SlashCommand = {
	name: "unban",
	restricted: true,
	data: new SlashCommandBuilder()
		.setName("unban")
		.setDescription("Unbanish someone from the server.")
		.addUserOption(option => 
			option
				.setName("user")
				.setDescription("The one who will be reintegrated !.")
				.setRequired(true)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) => 	
	{
		await interaction.deferReply();
		const userToUnban: User = interaction.options.getUser("user") as User;
		try
		{
			await interaction.guild?.members.unban(userToUnban);
			await interaction.editReply({content: `${getUserMentionFromId(userToUnban.id)} successfully unbaned!`, ephemeral: true});
		}
		catch(error)
		{
			console.log(error);
		}
	}
}