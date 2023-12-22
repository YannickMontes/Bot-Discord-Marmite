import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import musicHandler from "../../Music/MusicHandler";
import { SlashCommand } from "../../types";

export const command: SlashCommand = {
	name: "stop",
	data: new SlashCommandBuilder()
		.setName("stop")
		.setDescription("Reduce Marmite to silence."),
	execute: async (interaction: CommandInteraction) => 	
	{
		try
		{
			if(!interaction.member.voice.channel)
			{
				await interaction.reply(":x: You are not in a voice channel !")
			}
			else
			{
				let result = musicHandler.stop(interaction.guildId as string);
				await interaction.reply(result.message);
			}
		}
		catch(error)
		{
			console.log(error);
		}
	}
}