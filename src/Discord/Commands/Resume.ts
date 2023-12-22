import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import musicHandler from "../../Music/MusicHandler";
import { SlashCommand } from "../../types";

export const command: SlashCommand = {
	name: "resume",
	data: new SlashCommandBuilder()
		.setName("resume")
		.setDescription("Marmite make the party great again"),
	execute: async (interaction: CommandInteraction) => 	
	{
		await interaction.deferReply();
		try
		{
			if(!interaction.member.voice.channel)
			{
				await interaction.editReply(":x: You are not in a voice channel !")
			}
			else
			{
				let result = musicHandler.resume(interaction.guildId as string);
				await interaction.editReply(result.message);
			}
		}
		catch(error)
		{
			console.log(error);
		}
	}
}