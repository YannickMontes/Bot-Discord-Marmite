import {
	CommandInteraction,
	EmbedBuilder,
	GuildMember,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../types";
import { KnownLeagueCodes, StageSlug } from "../../LoL/LolAPItypes";
import lolRankingController, {
	IRankingResponse,
} from "../../Database/Controllers/lolRankingController";
import { ConvertLeagueCodeToColor, EnsureRankingIsComplete, GetLeagueCodeSlashCommandChoices, GetRankingDuplicates, GetStageSlashCommandChoices, GetTeamsOfStageInTournament } from "../../utils";
import lolAPIHandler, { IFinalRankingResult } from "../../LoL/LolAPIHandler";
import { RankingState } from "../../Database/Models/LolRanking";

export const command: SlashCommand = {
	name: "lolgetranking",
	restricted: false,
	data: CreateCommandBuilder(),
	execute: async (interaction: CommandInteraction) => {
		await interaction.deferReply();

		const leagueNameOption = interaction.options.get("leaguecode");
		const stageOption = interaction.options.get("stage");

		let leagueCode: KnownLeagueCodes = leagueNameOption?.value as KnownLeagueCodes;
		let user: GuildMember = interaction.options.getMember("user") as GuildMember;
		let stageSlug: StageSlug = stageOption?.value as StageSlug;
		let league = await lolAPIHandler.GetLeague(leagueCode);

		let tournamentId = "";
		let tournaments = await lolAPIHandler.GetCurrentOrUpcomingTournamentsFromCode(leagueCode);
		if(tournaments && tournaments.length > 1)
		{
			interaction.editReply(":x: Il y a plusieurs tournois à venir pour cette league. Utilise la commande /loltournament pour récupérer l'ID de celui que tu veux");
			return;
		}
		if(tournaments != null)
			tournamentId = tournaments[0].id;	

		let userId = user != null ? user.id : interaction.user.id;

		let res: IRankingResponse = await lolRankingController.GetRanking(
			interaction.guildId,
			userId,
			leagueCode,
			tournamentId,
			stageSlug
		);

		if (res.error) 
		{
			interaction.editReply(`:x: Error while getting ranking: ${res.error}`);
			return;
		}
		let rankingDB = res.ranking;
		if (rankingDB == null) 
		{
			let embed = new EmbedBuilder()
				.setTitle(`${user.user.username} ${leagueCode.toUpperCase()} ${stageSlug} Ranking` )
				.setAuthor({name: user.user.username, iconURL: user.user.avatarURL() as string})
				.setThumbnail(league?.image as string)
				.setColor(ConvertLeagueCodeToColor(leagueCode))
				.setDescription("No ranking.")
				.setTimestamp(new Date())
				.setFooter({text: `${leagueCode.toUpperCase()} - ${stageSlug} (Tournament ID: ${tournamentId})`, iconURL: league?.image});
			interaction.editReply({embeds: [embed]});
			return;
		}
		rankingDB = res.ranking;

		let finalRanking: IFinalRankingResult | null = null;
		if(rankingDB?.state == RankingState.ENDED)
		{
			finalRanking = await lolAPIHandler.GetFinalRankingForTournamentStage(rankingDB.tournamentId, stageSlug);
		}
		
		let stringRanking = "";
		let rankingCorrect:boolean = true;
		let duplicates: string[] = [];
		let differenceSum = 0;
		if(rankingDB != null)
		{
			let rankNumber = 1;
			for(let rank of rankingDB.ranking)
			{
				let emoji = rankNumber == 1 
					? "\u200B \u200B \u200B :trophy: \u200B :crown: \u200B :first_place:"
					: rankNumber == 2 
						? "\u200B \u200B \u200B:second_place:"
						: rankNumber == 3 
							? "\u200B \u200B \u200B:third_place:"
							: "";
				let finalTeam = finalRanking != null
					? `${finalRanking.finalRanking[rankNumber - 1]}`
					: "";
				let difference = finalRanking != null
					? `*(${rankingDB.diffWithRealRanking[rankNumber - 1]})*`
					: "";
				differenceSum += finalRanking != null 
					? Math.abs(rankingDB.diffWithRealRanking[rankNumber - 1])
					: 0;
				stringRanking += `**${rankNumber} - ${rank}**`;
				if(finalTeam != "")
				{
					stringRanking += ` | ${difference} | ${finalTeam} `;
				}
				stringRanking += `${emoji}\n`;
				rankNumber++;
			}
			rankingCorrect = EnsureRankingIsComplete(rankingDB.ranking);
			duplicates = GetRankingDuplicates(rankingDB.ranking);
		}

		if(rankingDB && rankingDB.state == RankingState.WAITING)
		{
			stringRanking += (!rankingCorrect || duplicates.length > 0)
				? `\n:x: Ranking not valid.`
				: "\n:white_check_mark: Ranking valid.";
		}
		else if(rankingDB && rankingDB.state == RankingState.ENDED)
		{
			stringRanking += "\nRanking total difference: " + differenceSum;
		}

		let embed = new EmbedBuilder()
			.setTitle(`${user.user.username} ${leagueCode.toUpperCase()} ${stageSlug} Ranking` )
			.setAuthor({name: user.user.username, iconURL: user.user.avatarURL() as string})
			.setThumbnail(league?.image as string)
			.setColor(ConvertLeagueCodeToColor(leagueCode))
			.setDescription(stringRanking)
			.setTimestamp(new Date())
			.setFooter({text: `${leagueCode.toUpperCase()} - ${stageSlug} (Tournament ID: ${tournamentId})`, iconURL: league?.image});

		interaction.editReply({embeds: [embed]});
	},
};

function CreateCommandBuilder(): SlashCommandBuilder {
	let builder = new SlashCommandBuilder()
		.setName("lolgetranking")
		.setDescription(
			"Create or update a ranking for a specific league."
		)
		.addUserOption((option) => 
			option
				.setName("user")
				.setDescription("The user you want to see the ranking.")
				.setRequired(true))
		.addStringOption((option) =>
			option
				.setName("leaguecode")
				.setDescription("The league code you want (LEC, LCK, LFL...)")
				.setRequired(true)
				.addChoices(...GetLeagueCodeSlashCommandChoices())
		)
		.addStringOption((option) => 
			option
				.setName("stage")
				.setDescription("The stage of competition (regular season, playoffs...)")
				.setRequired(true)
				.addChoices(...GetStageSlashCommandChoices())
		) as SlashCommandBuilder;
	return builder;
}