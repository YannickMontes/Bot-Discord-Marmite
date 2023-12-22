import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import musicHandler from "../../Music/MusicHandler";
import { SlashCommand } from "../../types";

export const command: SlashCommand = {
	name: "skip",
	data: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("Make marmite play the next song of queue."),
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
				let result = musicHandler.skip(interaction.guildId as string);
				await interaction.editReply(result.message);
			}
		}
		catch(error)
		{
			console.log(error);
		}
	}
}