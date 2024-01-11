import lolRankingController from "../Database/Controllers/lolRankingController";
import lolAPIHandler from "../LoL/LolAPIHandler";
import { KnownLeagueCodes, LeagueTournamentAPI, MatchState, StageSlug, TournamentStandingAPI } from "../LoL/LolAPItypes";

export async function registerToNextMidnight()
{
	checkNewLolEvents();
	let today = new Date();
	let tommorow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0);

	const timeUntilMidnight = tommorow.getTime() - today.getTime();

	setTimeout(() => {
		checkNewLolEvents();
	}, timeUntilMidnight);
}

let announcedEvents = [];

async function checkNewLolEvents()
{
	let leagues = await lolAPIHandler.GetLeagues();
	let allTournamentsPromises: Promise<LeagueTournamentAPI[]>[] = [];
	for(let league of leagues)
	{
		allTournamentsPromises.push(lolAPIHandler.GetCurrentOrUpcomingTournamentsForLeague(league));
	}
	let allLeagueTournaments = await Promise.all(allTournamentsPromises);

	let allTournamentsId = [];
	for(let leagueTournaments of allLeagueTournaments)
	{
		for(let leagueTournament of leagueTournaments)
		{
			allTournamentsId.push(leagueTournament.id);
		}
	}

	let activeRankings = await lolRankingController.GetTournamentsIdWithActiveRankings(allTournamentsId);
	let allStandingsPromises: Promise<TournamentStandingAPI[]>[] = [];
	for(let activeRanking of activeRankings)
	{
		allStandingsPromises.push(lolAPIHandler.GetStandingsForTournament(activeRanking.tournamentId));
	}

	let allTournamentsStandings = await Promise.all(allStandingsPromises);
	let rankingIndex = 0;
	for(let tournamentStanding of allTournamentsStandings)
	{
		let activeRanking = activeRankings[rankingIndex];
		for(let stage of tournamentStanding[0].stages)
		{
			if(activeRanking.tournamentStages.includes(stage.slug as StageSlug))
			{
				let uncompletedMatches = stage.sections[0].matches.filter(match => match.state != MatchState.Completed);
				let completed = uncompletedMatches.length == 0;
				if(completed)
				{

				}
				let finalRanking: string[] = new Array<string>(stage.sections[0].rankings.length);
				for(let ranking of stage.sections[0].rankings)
				{
					let allTeamCodes = ranking.teams.map(team => team.code);
					finalRanking[ranking.ordinal - 1] = allTeamCodes.toString();
				}
			}
		}
		rankingIndex++;
	}
}

// checkNewLolEvents();