import { CommandInteraction, SlashCommandBuilder, TextChannel, VoiceChannel } from "discord.js";
import musicHandler from "../../Music/MusicHandler";
import Song from "../../Music/Song";
import { SlashCommand } from "../../types";

export const command: SlashCommand = {
	name: "play",
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Play a song in your voice channel")
		.addStringOption(option => 
			option
				.setName("music")
				.setDescription("The music you want to play (URL, or keywords will be searched on YouTube)")
				.setRequired(true)) as SlashCommandBuilder,
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
				const musicToSearch = interaction.options.get("music")?.value as string;
				let songToPlay:Song = new Song();
				await songToPlay.init(musicToSearch);
				let result =  musicHandler.addToQueue(songToPlay, interaction.guildId as string, interaction.member.voice as VoiceChannel, interaction.channel as TextChannel);
				await interaction.editReply(result.message);
			}
		}
		catch(error)
		{
			console.log(error);
		}
	}
}