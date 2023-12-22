import { CommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
import { getUserMentionFromId } from "../../utils";

export const command: SlashCommand = {
	name: "unmute",
	restricted: true,
	data: new SlashCommandBuilder()
		.setName("unmute")
		.setDescription("Remove the sctoch from the mouse of specified user")
		.addUserOption(option => 
			option
				.setName("user")
				.setDescription("The one who is silenced ")
				.setRequired(true)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) => 	
	{
		await interaction.deferReply();
		const userToUnmute: GuildMember = interaction.options.getMember("user") as GuildMember;
		try
		{
			await userToUnmute.timeout(null);
			await interaction.editReply(`User ${getUserMentionFromId(userToUnmute.id)} can talk again !\nEnjoy Buddy ! :sunglasses:`);
		}
		catch(error)
		{
			console.log(error);
		}
	}
}