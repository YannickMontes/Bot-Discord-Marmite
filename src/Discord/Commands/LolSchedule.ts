import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
import lolAPIHandler from "../../LoL/LolAPIHandler";
import { KnownLeagueCodes } from "../../LoL/LolAPItypes";
import { ConvertLeagueCodeToColor, GetLeagueCodeSlashCommandChoices, GetNiceDate, GetResizedImageURL, MakeDiscordEmbedsForEvents } from "../../utils";

export const command: SlashCommand = {
	name: "lolschedule",
	restricted: false,
	data: CreateCommandBuilder(),
	execute: async (interaction: CommandInteraction) => {
		await interaction.deferReply();
		const leagueNameOption = interaction.options.get("leaguecode");
		let leagueCode: KnownLeagueCodes = leagueNameOption?.value as KnownLeagueCodes;
		let description = "No current/upcoming events.";
		let league = await lolAPIHandler.GetLeague(leagueCode);
		let events = await lolAPIHandler.GetUpcomingScheduleForLeague(leagueCode);

		let embeds: EmbedBuilder[] = [];
		if(events && league)
			embeds = MakeDiscordEmbedsForEvents(events, leagueCode, league);

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