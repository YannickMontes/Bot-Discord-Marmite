import { IsSameDay } from "../utils";
import { KnownLeagueCodes, LeagueAPI, LeagueTournamentAPI, LoLEvent, MatchState, StageSectionAPI, StageSlug, TeamAPI, TeamRankingRecordAPI, TournamentStandingAPI } from "./LolAPItypes";
import axios from "axios";

class LoLAPIHandler 
{
	RIOT_URLS = {
		LEAGUE: "https://esports-api.lolesports.com/persisted/gw/getLeagues?hl=fr-FR",
		LEAGUE_TOURNAMENTS:
			"https://esports-api.lolesports.com/persisted/gw/getTournamentsForLeague?hl=fr-FR&leagueId=",
		TOURNAMENT_STANDINGS:
			"https://esports-api.lolesports.com/persisted/gw/getStandings?hl=fr-FR&tournamentId=",
		SCHEDULE:
			"https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=fr-FR&leagueId=",
		COMPLETED_EVENTS:
			"https://esports-api.lolesports.com/persisted/gw/getCompletedEvents?hl=fr-FR",
		TEAMS:
			"https://esports-api.lolesports.com/persisted/gw/getTeams?hl=fr-FR",
	};

	axiosGetConfig = {
		headers: {
			"x-api-key": "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z",
		},
	};

	async GetLeagues(): Promise<LeagueAPI[]> 
	{
		let res = await axios.get(this.RIOT_URLS.LEAGUE, this.axiosGetConfig);
		let leaguesResult: LeagueAPI[] = res.data.data.leagues;
		return leaguesResult;
	}

	async GetLeague(leagueCode: KnownLeagueCodes) : Promise<LeagueAPI | undefined>
	{
		let leagues = await this.GetLeagues();
		let wantedLeague = leagues.find(league => league.slug == leagueCode);
		return wantedLeague;
	}

	async GetAllTournamentsForLeague(league: LeagueAPI)  : Promise<LeagueTournamentAPI[]>
	{
		let res = await axios.get(this.RIOT_URLS.LEAGUE_TOURNAMENTS + league.id, this.axiosGetConfig);
		return res.data.data.leagues[0].tournaments;
	}

	async GetStandingsForTournament(tournamentId: string): Promise<TournamentStandingAPI[]> 
	{
		let res = await axios.get(this.RIOT_URLS.TOURNAMENT_STANDINGS + tournamentId, this.axiosGetConfig);
		return res.data.data.standings;
	}

	async GetUpcomingScheduleForLeague(leagueCode: KnownLeagueCodes) : Promise<LoLEvent[] | null>
	{
		let leagueAPI = await this.GetLeague(leagueCode);
		if(leagueAPI == null)
			return null;

		let allEvents:LoLEvent[] = [];
		let res = await axios.get(this.RIOT_URLS.SCHEDULE + leagueAPI.id, this.axiosGetConfig);
		while(res.data.data.schedule.pages.newer != null)
		{
			allEvents = allEvents.concat(res.data.data.schedule.events);
			res = await axios.get(this.RIOT_URLS.SCHEDULE + leagueAPI.id + `&pageToken=${res.data.data.schedule.pages.newer}`, this.axiosGetConfig);
		}
		allEvents = allEvents.concat(res.data.data.schedule.events);
		allEvents = allEvents.filter(event => event.state != "completed");
		return allEvents;
	}

	async GetDailySchedule(leagueCode:KnownLeagueCodes, date: Date) : Promise<LoLEvent[] | null>
	{
		let schedule = await this.GetUpcomingScheduleForLeague(leagueCode);
		let todaySchedule: LoLEvent[] = [];
		if(schedule != null)
		{
			for(let event of schedule)
			{
				if(IsSameDay(date, new Date(event.startTime)))
				{
					todaySchedule.push(event);
				}
			}
		}
		return todaySchedule;
	}

	async GetCurrentOrUpcomingTournamentsFromCode(leagueCode: KnownLeagueCodes): Promise<LeagueTournamentAPI[] | null>
	{
		let leagueAPI = await this.GetLeague(leagueCode);

		if(!leagueAPI)
			return null;

		return await this.GetCurrentOrUpcomingTournamentsForLeague(leagueAPI);
	}

	async GetCurrentOrUpcomingTournamentsForLeague(leagueAPI: LeagueAPI) : Promise<LeagueTournamentAPI[]>
	{
		let tournaments = await this.GetAllTournamentsForLeague(leagueAPI);
		return this.GetCurrentOrUpcomingTournaments(tournaments);
	}

	private GetCurrentOrUpcomingTournaments(tournaments: LeagueTournamentAPI[]): LeagueTournamentAPI[] 
	{
		let actualsTournaments: LeagueTournamentAPI[] = [];
		let currentDate: Date = new Date();
		actualsTournaments = tournaments.filter(tournament => new Date(tournament.endDate) > currentDate);
		return actualsTournaments;
	}

	private GetLeagueBySlug(leagues: LeagueAPI[], slug: string): LeagueAPI | null
	{
		let wantedLeague = null;
		leagues.forEach(league => {
			if (league.slug == slug)
			{
				wantedLeague = league;
				return;
			}
		});
		return wantedLeague;
	}

	async GetFirstTournamentForLeagueSlug(slug: string) : Promise<LeagueTournamentAPI | null>
	{
		let leagues = await this.GetLeagues();
		let wantedLeague = this.GetLeagueBySlug(leagues, slug);
		
		if(!wantedLeague)
		{
			return null;
		}
		
		let tournaments = await this.GetAllTournamentsForLeague(wantedLeague);
		return tournaments.length > 0 ? tournaments[0] : null;
	}


	async TournamentStageHasAtLeastOneCompletedMatch(tournamentId: string, stage: StageSlug)
	{
		let standings = await this.GetStandingsForTournament(tournamentId);
		let wantedStage = standings[0].stages.find(stageAPI => stageAPI.slug == stage);
		if(!wantedStage)
			return false;
		let completedMatches = wantedStage.sections[0].matches.filter(match => match.state == MatchState.Completed);
		return completedMatches.length > 0;
	}

	async IsTournamentStageCompleted(tournamentId: string, stage: StageSlug) : Promise<boolean>
	{
		let standings = await this.GetStandingsForTournament(tournamentId);
		let wantedStage = standings[0].stages.find(stageAPI => stageAPI.slug == stage);
		if(!wantedStage)
			return false;
		let isCompleted = wantedStage.sections[0].matches.every(match => match.state == MatchState.Completed);
		return isCompleted;
	}

	async GetFinalRankingForTournamentStage(tournamentId: string, stage: StageSlug)
		: Promise<IFinalRankingResult>
	{
		let standings = await this.GetStandingsForTournament(tournamentId);
		let wantedStage = standings[0].stages.find(stageAPI => stageAPI.slug == stage);
		if(!wantedStage)
			return { finalRanking:[], finalRecord:[] };
		let finalRanking = new Array<string>(10);
		let finalRecord = new Array<TeamRankingRecordAPI>(10);
		wantedStage.sections[0].rankings.forEach(ranking => {
			ranking.teams.forEach(team => {
				let wantedIndex = ranking.ordinal - 1;
				while(finalRanking[wantedIndex] != undefined)
				{
					wantedIndex++;
				}
				finalRanking[wantedIndex] = team.code;
				if(team.record)
					finalRecord[wantedIndex] = team.record;
			});
		});
		return { finalRanking, finalRecord };
	}

	async GetTeams(leagueCode: KnownLeagueCodes)
	{
		let res = await axios.get(this.RIOT_URLS.TEAMS, this.axiosGetConfig);
		let KC = res.data.data.teams.filter((team: TeamAPI) => team.code == "KC");
		// let LECTeams = res.data.data.teams.filter((team: MatchTeamAPI)  => team.homeLeague && team.homeLeague.name == "LEC" && x.status == "active" && x.players.length > 0);
		// console.log(LECTeams);
	}
}

export interface IFinalRankingResult
{
	finalRanking: string[], 
	finalRecord: TeamRankingRecordAPI[]
}

const lolAPIHandler = new LoLAPIHandler();
export default lolAPIHandler;