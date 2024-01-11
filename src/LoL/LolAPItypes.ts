export enum KnownLeagueCodes
{
	LEC = "lec",
	LFL = "lfl",
	LCK = "lck",
	LCS = "lcs"
}

export enum StageSlug
{
	REGULAR_SEASON = "regular_season",
	PLAYOFFS = "playoffs"
}

export enum MatchState 
{
	Unstarted = "unstarted",
	InProgress = "inProgress",
	Completed = "completed",
}

export enum MatchOutcome {
	Win = "win",
	Loss = "loss",
}

export interface LeagueAPI {
	id: string;
	slug: string;
	name: string;
	region: string;
	image: string;
	priority: number;
}

export interface LeagueTournamentAPI {
	id: string;
	slug: string;
	startDate: Date;
	endDate: Date;
}

export interface TournamentStandingAPI {
	stages: TournamentStageAPI[];
}

export interface TournamentStageAPI {
	name: string;
	slug: string;
	type: any;
	sections: StageSectionAPI[];
}

export interface StageSectionAPI {
	name: string;
	matches: MatchAPI[];
	rankings: SectionRankingAPI[];
}

export interface TeamAPI 
{
	id: string;
	slug: string;
	name: string;
	code: string;
	image: string;
	record?: TeamRankingRecordAPI;
	result?: ResultMatchTeamAPI;
}

export interface MatchAPI
{
	id: string, 
	state: MatchState,
	previousMatchIds: [string] | null,
	flags: string[],
	teams: TeamAPI[],
	strategy?: StrategyAPI
}

export interface StrategyAPI
{
	type: string, // bestOf, playAll ????
	count: number
}

export interface ResultMatchTeamAPI {
	gameWins: number;
	outcome: MatchOutcome;
}

export interface SectionRankingAPI {
	ordinal: number;
	teams: TeamAPI[];
}

export interface TeamRankingRecordAPI {
	losses: number;
	wins: number;
}

export interface LoLEvent 
{
	startTime: Date;
	state: MatchState;
	type: string; // ??
	blockName: string;
	league: Omit<LeagueAPI, "id" | "priority" | "region" | "image">,
	match: MatchAPI
}