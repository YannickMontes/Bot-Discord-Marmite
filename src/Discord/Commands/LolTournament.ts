import { Colors, CommandInteraction, EmbedBuilder, SlashCommandBuilder, embedLength } from "discord.js";
import { SlashCommand } from "../../types";
import lolAPIHandler from "../../LoL/LolAPIHandler";
import { KnownLeagueCodes } from "../../LoL/LolAPItypes";
import { ConvertLeagueCodeToColor, GetLeagueCodeSlashCommandChoices, GetNiceDate, GetResizedImageURL } from "../../utils";

export const command: SlashCommand = {
	name: "loltournament",
	restricted: false,
	data: CreateCommandBuilder(),
	execute: async (interaction: CommandInteraction) => {
		await interaction.deferReply();

		const leagueNameOption = interaction.options.get("leaguecode");
		let leagueCode: KnownLeagueCodes = leagueNameOption?.value as KnownLeagueCodes;
		let league = await lolAPIHandler.GetLeague(leagueCode);
		let description = "No current/upcoming tournaments.";
		let tournaments = await lolAPIHandler.GetCurrentOrUpcomingTournamentsFromCode(leagueCode);
		let embeds: EmbedBuilder[] = [];
		if(tournaments != null && tournaments.length > 0)
		{
			description = "";
			for(let tournament of tournaments)
			{
				description += `**${tournament.slug}**\nDébut: ${GetNiceDate(tournament.startDate, false)}\nFin: ${GetNiceDate(tournament.endDate, false)}\n`;
				let embed = new EmbedBuilder()
					.setTitle(`${leagueCode.toUpperCase()} - ${tournament.slug}`)
					.setAuthor({name: leagueCode.toUpperCase(), iconURL: league?.image})
					.setFooter({text: leagueCode.toUpperCase() + ` - Tournament ID: ${tournament.id}`, iconURL: league?.image})
					.setColor(ConvertLeagueCodeToColor(leagueCode))
					.setDescription(description);
					embeds.push(embed);
			}
		}
		if(embeds.length > 0)
			interaction.editReply({ embeds });
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
		.setName("loltournament")
		.setDescription("Get the next tournaments informations for a LoL league.")
		.addStringOption( (option) => 
			option
				.setName("leaguecode")
				.setDescription("The league code you want (LEC, LCK, LFL...)")
				.setRequired(true)
				.addChoices(...GetLeagueCodeSlashCommandChoices())
		) as SlashCommandBuilder;
	return builder;
}