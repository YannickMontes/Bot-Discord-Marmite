import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../types";
import { KnownLeagueCodes, StageSlug } from "../../LoL/LolAPItypes";
import lolRankingController, {
	IRankingResponse,
} from "../../Database/Controllers/lolRankingController";
import { ConvertLeagueCodeToColor, EnsureRankingIsComplete, GetLeagueCodeSlashCommandChoices, GetRankingDuplicates, GetStageSlashCommandChoices, MergeRankings, UNKNOWN_RANKING_CHAR, getUserMentionFromId } from "../../utils";
import lolAPIHandler from "../../LoL/LolAPIHandler";

export const command: SlashCommand = {
	name: "lolupdateranking",
	restricted: false,
	data: CreateCommandBuilder(),
	execute: async (interaction: CommandInteraction) => {
		await interaction.deferReply();

		const leagueNameOption = interaction.options.get("leaguecode");
		const stageOption = interaction.options.get("stage");
		const tournamentIdOption = interaction.options.get("tournamentid");

		let leagueCode: KnownLeagueCodes = leagueNameOption?.value as KnownLeagueCodes;
		let stageSlug: StageSlug = stageOption?.value as StageSlug;
		let tournamentId = tournamentIdOption?.value as string;
		let ranking: string[] = [];
		let league = await lolAPIHandler.GetLeague(leagueCode);

		if(!tournamentId)
		{
			let tournaments = await lolAPIHandler.GetCurrentOrUpcomingTournamentsFromCode(leagueCode);
			if(tournaments && tournaments.length > 1)
			{
				interaction.editReply(":x: Il y a plusieurs tournois à venir pour cette league. Utilise la commande /loltournament pour récupérer l'ID de celui que tu veux.");
				return;
			}
			if(tournaments != null)
			{
				tournamentId = tournaments[0].id;
				if(new Date() > new Date(tournaments[0].startDate))
				{
					interaction.editReply(":x: Impossible de modifier le ranking une fois la compétition commencée !\n"
					+ "Tu peux utiliser la commande lolgetranking pour consulter ton ranking.");
					return;
				}
			}
		}

		let standings = await lolAPIHandler.GetStandingsForTournament(tournamentId);

		let possiblesTeamTags: string[] = [];
		if(standings && standings.length > 0)
		{
			for(let stage of standings[0].stages)
			{
				if(stage.slug == stageSlug)
				{
					if(stage.sections[0].rankings.length == 0)
					{
						break;
					}
					for(let team of stage.sections[0].rankings[0].teams)
					{
						if(!possiblesTeamTags.includes(team.code))
							possiblesTeamTags.push(team.code);
					}
				}
			}
		}

		let unknownTeamTags = [];
		for (let i = 0; i < 10; i++) 
		{
			const rankParam = interaction.options.get(`rank${i + 1}`);
			if (!rankParam) 
				ranking.push(UNKNOWN_RANKING_CHAR);
			else
			{
				let team = rankParam.value as string;
				if(possiblesTeamTags.includes(team))
					ranking.push(team);
				else
				{
					ranking.push(UNKNOWN_RANKING_CHAR);
					unknownTeamTags.push(team);
				}
			}
		}

		let userId = interaction.user?.id;

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
			res = await lolRankingController.CreateRanking(
				interaction.guildId,
				userId,
				leagueCode,
				tournamentId,
				stageSlug,
				ranking
			);
			if (res.error) 
			{
				interaction.editReply(`:x: Error while creating ranking: ${res.error}`);
				return;
			}
			rankingDB = res.ranking;
		}
		else 
		{
			ranking = MergeRankings(rankingDB?.ranking, ranking);
			res = await lolRankingController.UpdateRanking(
				interaction.guildId,
				userId,
				leagueCode,
				tournamentId,
				stageSlug,
				ranking
			);
			if (res.error) 
			{
				interaction.editReply(`:x: Error while updating ranking: ${res.error}`);
				return;
			}
			rankingDB = res.ranking;
		}

		let stringRanking = "";
		let rankingCorrect:boolean = true;
		let duplicates: string[] = [];
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
				stringRanking += `**${rankNumber} - ${rank}** ${emoji}\n`;
				rankNumber++;
			}
			rankingCorrect = EnsureRankingIsComplete(rankingDB.ranking);
			duplicates = GetRankingDuplicates(rankingDB.ranking);
		}
		
		let warning = rankingCorrect 
			? ""
			: "\n :warning: Your ranking is not completed.";

		warning += duplicates.length > 0 
			? "\n:warning: Your ranking have duplicates: " + duplicates
			: "";

		let notFoundTeams = "";
		if(unknownTeamTags.length > 0)
		{
			notFoundTeams = "\n :x: Can't found following teams: " + unknownTeamTags;
			notFoundTeams += "\nPossibles teams are: " + possiblesTeamTags;
		}

		stringRanking += (notFoundTeams != "" || warning != "")
			? `${notFoundTeams} ${warning}`
			: "\n:white_check_mark: Ranking valid.";

		let embed = new EmbedBuilder()
			.setTitle(`${interaction.user.username} ${leagueCode.toUpperCase()} ${stageSlug} Ranking` )
			.setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL() as string})
			.setThumbnail(league?.image as string)
			.setColor(ConvertLeagueCodeToColor(leagueCode))
			.setDescription(stringRanking)
			.setFooter({text: `${leagueCode.toUpperCase()} - ${stageSlug}`, iconURL: league?.image});

		interaction.editReply({embeds: [embed]});
	},
};

function CreateCommandBuilder(): SlashCommandBuilder {
	let builder = new SlashCommandBuilder()
		.setName("lolupdateranking")
		.setDescription(
			"Create or update a ranking for a specific league."
		)
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
		)
		.addStringOption((option) =>
			option
				.setName("tournamentid")
				.setDescription(
					"The tournament ID. If none, it will be for the current or next tournament."
				)
				.setRequired(false)
		) as SlashCommandBuilder;
	builder = AddOptionCommandBuilder(builder);
	return builder;
}

function AddOptionCommandBuilder(builder: SlashCommandBuilder): SlashCommandBuilder 
{
	for (let i = 0; i < 10; i++) 
	{
		builder = builder.addStringOption((option) =>
			option
				.setName(`rank${i + 1}`)
				.setDescription(`Predicted rank ${i + 1} for the tournament. You can leave it empty.`)
				.setRequired(false)
		) as SlashCommandBuilder;
	}
	return builder;
}