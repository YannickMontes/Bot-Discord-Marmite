import { HydratedDocument } from "mongoose";
import { KnownLeagueCodes, StageSlug, StageSlug as TournamentStageSlug } from "../../LoL/LolAPItypes";
import LolRanking, { ILoLRanking, RankingState } from "../Models/LolRanking";

export interface IRankingResponse
{
	ranking?: HydratedDocument<ILoLRanking> | null,
	error?: unknown
}

export interface IRankingsResponse
{
	rankings?: HydratedDocument<ILoLRanking>[],
	error?: unknown
}

export interface IActiveTournamentStages
{
	tournamentId: string,
	tournamentStages: StageSlug[]
}

class LolRankingDBController
{
	async GetRankingsForUserAndLeague(guildId: string, user: string, leagueCode: KnownLeagueCodes) : Promise<IRankingsResponse>
	{
		try
		{
			let rankings = await LolRanking.find({guildId, user, leagueCode});
			return {rankings}
		}
		catch(error)
		{
			return { error }
		}
	}

	async GetTournamentsIdWithActiveRankings(tournamentsId: string[])
		: Promise<IActiveTournamentStages[]>
	{
		try
		{
			let result:IActiveTournamentStages[] = await LolRanking.aggregate([
				{$match: {tournamentId: {$in: tournamentsId}, state: RankingState.WAITING}},
				{$group: {_id: "$tournamentId", tournamentStages : { $addToSet: '$tournamentStage'}}},
				{$project: {_id: 0, tournamentId: '$_id', tournamentStages: 1}}
			]);
			return result;
		}
		catch(error)
		{
			return [];
		}
	}

	async GetRanking(guildId: string | null, user: string
		, leagueCode: KnownLeagueCodes
		, tournamentId: string | null
		, tournamentStage: TournamentStageSlug) : Promise<IRankingResponse>
	{
		try
		{
			let ranking = await LolRanking.findOne({ guildId, user, leagueCode, tournamentId, tournamentStage });
			return { ranking };
		}
		catch(error)
		{
			return { error }
		}
	}

	async CreateRanking(guildId: string | null
		, user: string, leagueCode: KnownLeagueCodes
		, tournamentId: string | null
		, tournamentStage: TournamentStageSlug
		, ranking: string[]): Promise<IRankingResponse>
	{
		try
		{
			let rankingInstance = new LolRanking({
				guildId,
				user,
				leagueCode, 
				tournamentId,
				tournamentStage,
				ranking
			});
			await rankingInstance.save();
			return { ranking: rankingInstance};
		}
		catch(error)
		{
			return { error };
		}
	}

	async UpdateRanking(guildId: string | null
		, user: string
		, leagueCode: KnownLeagueCodes
		, tournamentId: string | null
		, tournamentStage: StageSlug
		, ranking: string[]): Promise<IRankingResponse>
	{
		try
		{
			let rankingInstance = await LolRanking.findOneAndUpdate(
				{ guildId, user, leagueCode, tournamentId, tournamentStage }
				, {tournamentId, ranking}
				, { new: true});
			return { ranking: rankingInstance};
		}
		catch(error)
		{
			return { error };
		}
	}
}

const lolRankingController = new LolRankingDBController();
export default lolRankingController;