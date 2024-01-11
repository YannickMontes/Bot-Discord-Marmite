import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
import lolAPIHandler from "../../LoL/LolAPIHandler";
import { KnownLeagueCodes } from "../../LoL/LolAPItypes";
import { ConvertLeagueCodeToColor, GetLeagueCodeSlashCommandChoices, GetNiceDate, GetResizedImageURL } from "../../utils";

export const command: SlashCommand = {
	name: "lolschedule",
	restricted: false,
	data: CreateCommandBuilder(),
	execute: async (interaction: CommandInteraction) => {
		await interaction.deferReply();
		const leagueNameOption = interaction.options.get("leaguecode");
		let leagueCode: KnownLeagueCodes = leagueNameOption?.value as KnownLeagueCodes;
		let description = "No current/upcoming tournaments.";
		let league = await lolAPIHandler.GetLeague(leagueCode);
		let events = await lolAPIHandler.GetUpcomingScheduleForLeague(leagueCode);

		let embeds: EmbedBuilder[] = [];
		if(events != null && events.length > 0)
		{
			for(let event of events)
			{
				if(event.state != "completed")
				{
					let embed = new EmbedBuilder()
						.setTitle(`${event.match.teams[0].code} - ${event.match.teams[1].code}`)
						.setDescription(`${GetNiceDate(event.startTime, true)}\n`)
						.setThumbnail(GetResizedImageURL(event.match.teams[0].image))
						.setImage(GetResizedImageURL(event.match.teams[1].image))
						.setColor(ConvertLeagueCodeToColor(leagueCode))
						.setAuthor({name: leagueCode.toUpperCase() + " - " + event.blockName, iconURL: league?.image})
						.setFooter({text: leagueCode.toUpperCase() + ` - Match ID: ${event.match.id}`, iconURL: league?.image})
					embeds.push(embed);
				}
			}
		}

		if(embeds.length > 0)
		{
			let replied = false;
			while(embeds.length > 0)
			{
				let sendEmbeds : EmbedBuilder[] = [];
				for(let i =0; i < 10 && embeds.length > 0; i++)
				{
					let embed: EmbedBuilder | undefined = embeds.shift();
					if(embed != null)
						sendEmbeds.push(embed);
				}
				if(!replied)
				{
					await interaction.editReply({ embeds: sendEmbeds });
					replied = true;
				}
				else
				{
					interaction.followUp( {embeds: sendEmbeds } );
				}
			}
		}
		else
		{
			let embed = new EmbedBuilder()
					.setTitle(`${leagueCode.toUpperCase()}`)
					.setAuthor({name: leagueCode.toUpperCase(), iconURL: league?.image})
					.setFooter({text: leagueCode.toUpperCase(), iconURL: league?.image})
					.setColor(ConvertLeagueCodeToColor(leagueCode))
					.setDescription(description);
			interaction.editReply({embeds: [embed]});
		}
	},
};

function CreateCommandBuilder(): SlashCommandBuilder
{
	let builder =  new SlashCommandBuilder()
		.setName("lolschedule")
		.setDescription("Get the next scheduled events for a LoL league.")
		.addStringOption( (option) => 
			option
				.setName("leaguecode")
				.setDescription("The league code you want (LEC, LCK, LFL...)")
				.setRequired(true)
				.addChoices(...GetLeagueCodeSlashCommandChoices())
		) as SlashCommandBuilder;
	return builder;
}