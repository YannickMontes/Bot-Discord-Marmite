import { model, Schema } from "mongoose";
import { KnownLeagueCodes, StageSlug } from "../../LoL/LolAPItypes";

export interface ILoLRanking 
{
	guildId: string,
	user: string,
	leagueCode: KnownLeagueCodes,
	leagueId: string,
	tournamentId: string,
	tournamentStage: StageSlug
	ranking: string[],
	state: RankingState,
	diffWithRealRanking: number[]
}

export enum RankingState
{
	WAITING = "WAITING",
	ENDED = "ENDED"
}

const LolRankingSchema = new Schema<ILoLRanking>(
	{
		guildId: {
			type: String,
			required: true,
		},
		user: {
			type: String,
			required: true,
		},
		leagueCode: {
			type: String,
			enum: Object.values(KnownLeagueCodes),
			required: true
		},
		tournamentStage: {
			type: String,
			enum: Object.values(StageSlug),
			required: true
		},
		leagueId: {
			type: String,
			default: null
		},
		tournamentId: {
			type: String,
			default: ""
		},
		ranking:
		{
			type: [String],
			required: true
		},
		diffWithRealRanking:
		{
			type: [Number],
			default: []
		},
		state:
		{
			type: String,
			enum: Object.values(RankingState),
			default: RankingState.WAITING
		}
	},
	{ minimize: false }
);

LolRankingSchema.index({guildId: 1, user: 1, leagueId: 1, tournamentId: 1, tournamentStage: 1}, {unique: true});
const LolRanking = model<ILoLRanking>("LolRanking", LolRankingSchema);
export default LolRanking;
