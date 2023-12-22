import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
const fetch = require("node-fetch");

interface ISongLinkResult 
{
	entityUniqueId: string,
	userCountry: string,
	pageUrl: string,
	entitiesByUniqueId: Map<string, object>,
	linksByPlatform: Map<string, IPlatformResult>
}

interface IPlatformResult
{country: string, url: string, entityUniqueId: string}

const acceptedPlatforms = ["spotify", "deezer", "youtube", "youtubeMusic"];

export const command: SlashCommand = {
	name: "songlink",
	data: new SlashCommandBuilder()
		.setName("songlink")
		.setDescription("Share a music with all the links !")
		.addStringOption(option => 
			option
				.setName("music")
				.setDescription("The source of the music you want to share")
				.setRequired(true)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) => 
	{
		await interaction.deferReply();
		let musicUrl = interaction.options.get("music")?.value as string;
		let apiUrl = `https://api.song.link/v1-alpha.1/links?url=${musicUrl}`;
		try
		{
			let result = await fetch(apiUrl);
			let jsonResult = await result.json() as ISongLinkResult;
	
			let description = `**GLOBAL LINK:** *${jsonResult.pageUrl}*\n`;
			
			for(const platform in jsonResult.linksByPlatform)
			{
				if(acceptedPlatforms.includes(platform))
				{
					let url = jsonResult.linksByPlatform[platform].url;
					description += `\n**${platform.toUpperCase()}:**\n*${url}*`;
				}
			}

			let thumbnailUrl = null;
			let embedTitle = null;
			for(const entity in jsonResult.entitiesByUniqueId)
			{
				embedTitle = jsonResult.entitiesByUniqueId[entity].title + " - " + jsonResult.entitiesByUniqueId[entity].artistName; 
				if(jsonResult.entitiesByUniqueId[entity].thumbnailUrl)
				{
					thumbnailUrl = jsonResult.entitiesByUniqueId[entity].thumbnailUrl;
					break;
				}
			}
	
			let songlinkEmbed = new EmbedBuilder()
				.setTitle(embedTitle)
				.setColor("Random")
				.setDescription(description)
				.setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL() as string})
				.setTimestamp();

			if(thumbnailUrl != null)
			{
				songlinkEmbed.setThumbnail(thumbnailUrl);
			}
	
			await interaction.editReply({embeds:[songlinkEmbed]});
		}
		catch(error)
		{
			console.log(error);
			await interaction.editReply(":x: Something went wrong on the songlink command.");
		}
	}
}