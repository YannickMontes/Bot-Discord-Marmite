import { ChannelType, CommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
import { LolEventType } from "../../Database/Models/LolChannelParams";
import lolChannelParamsController from "../../Database/Controllers/lolChannelParamsController";
import { ConvertLeagueCodeToColor, GetSlashCommandsChoicesForEnum, getChannelMentionFromid } from "../../utils";
import { KnownLeagueCodes } from "../../LoL/LolAPItypes";
import lolAPIHandler from "../../LoL/LolAPIHandler";

export const command: SlashCommand = {
	name: "lolchannel",
	restricted: false,
	data: CreateCommandBuilder(),
	execute: async (interaction: CommandInteraction) => {
		await interaction.deferReply();

		if(interaction.guild == null)
		{
			await interaction.editReply("No guild. Abort.")
			return;
		}
		
		const eventTypeOption = interaction.options.get("eventtype");
		const eventType = eventTypeOption?.value as LolEventType;
		
		const channelOption = interaction.options.get("channel");
		const channel = channelOption?.channel;

		const leagueCodeOption = interaction.options.get("league");
		const leagueCode = leagueCodeOption?.value as KnownLeagueCodes;

		const league = await lolAPIHandler.GetLeague(leagueCode);
		
		let channelParams = null;
		let updateDesc = "";
		if(channel == null || eventType == null)
		{
			channelParams = (await lolChannelParamsController.GetChannelParamsForGuild(interaction.guild.id, leagueCode)).channelParams;
		}
		else
		{
			updateDesc = "\n:white_check_mark: Successfully update params !"
			channelParams = (await lolChannelParamsController.UpdateParamsForGuild(interaction.guild.id, leagueCode, eventType, channel.id)).channelParams;
		}

		let finalDesc = "";
		for(let event of Object.values(LolEventType))
		{
			let channelValue = channelParams?.eventChannels?.get(event);
			finalDesc += `**${event}** => `;
			finalDesc += channelValue ? getChannelMentionFromid(channelValue) : "NONE";
			finalDesc += "\n";
		}

		finalDesc += updateDesc;

		let embed = new EmbedBuilder()
			.setAuthor({name: (interaction.member as GuildMember).nickname as string, iconURL: interaction.user.avatarURL() as string})
			.setTitle(interaction.guild.name + " " +  leagueCode + " Channel Params")
			.setDescription(finalDesc)
			.setThumbnail(league?.image as string)
			.setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL() as string})
			.setTimestamp(new Date())
			.setColor(ConvertLeagueCodeToColor(leagueCode));

		await interaction.editReply({embeds: [embed]});
	},
};

function CreateCommandBuilder(): SlashCommandBuilder
{
	let builder =  new SlashCommandBuilder()
		.setName("lolchannel")
		.setDescription("Set the different channel where the bot will trigger events. Inspect if no params.")
		.addStringOption( (option) => 
			option
				.setName("league")
				.setDescription("League code you want")
				.setRequired(true)
				.setChoices(...GetSlashCommandsChoicesForEnum(KnownLeagueCodes))
		)
		.addStringOption( (option) => 
			option
				.setName("eventtype")
				.setDescription("The event type you want")
				.setRequired(false)
				.addChoices(...GetSlashCommandsChoicesForEnum(LolEventType))
		)
		.addChannelOption((option) => 
			option
				.setName("channel")
				.setDescription("The channel you want the bot to post messages")
				.setRequired(false)
				.addChannelTypes(ChannelType.GuildText)
		) as SlashCommandBuilder;
	return builder;
}

