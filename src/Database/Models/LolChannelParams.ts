import { model, Schema } from "mongoose";
import { KnownLeagueCodes } from "../../LoL/LolAPItypes";

export interface ILolChannelParams 
{
	guildId: string,
	leagueCode: KnownLeagueCodes,
	eventChannels: Map<LolEventType, string>
}

export enum LolEventType
{
	SCHEDULE = "SCHEDULE",
	RESULTS = "RESULTS",
	RANKINGS = "RANKINGS"
}

const LolChannelParamsSchema = new Schema<ILolChannelParams>(
	{
		guildId: {
			type: String,
			required: true
		},
		leagueCode: {
			type: String,
			enum: Object.values(KnownLeagueCodes),
			required: true
		},
		eventChannels: {
			type: Map,
			of: String,
			required: true,
			default: {}
		}
	},
	{ minimize: false }
);

LolChannelParamsSchema.index({guildId: 1, leagueCode: 1}, {unique: true});
const LolChannelParams = model<ILolChannelParams>("LolChannel", LolChannelParamsSchema);
export default LolChannelParams;
