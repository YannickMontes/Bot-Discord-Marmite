import { HydratedDocument } from "mongoose";
import LolChannelParams, { ILolChannelParams, LolEventType } from "../Models/LolChannelParams";
import { KnownLeagueCodes } from "../../LoL/LolAPItypes";

export interface LolChannelParamsResponse
{
	channelParams: HydratedDocument<ILolChannelParams> | null
}

export interface MultipleLolChannelParamsResponse
{
	channelParams: HydratedDocument<ILolChannelParams>[]
}

class LolChannelParamsController
{
	async UpdateParamsForGuild(guildId: string, leagueCode: KnownLeagueCodes, event: LolEventType, channelId: string)
	{
		try
		{
			let channelParamsRes = await this.GetChannelParamsForGuild(guildId, leagueCode);
			let channelParams = channelParamsRes.channelParams; 
			if(channelParams == null)
			{
				channelParamsRes = await this.CreateChannelParamsForGuild(guildId, leagueCode);
				channelParams = channelParamsRes.channelParams;
			}
			if(channelParams != null)
			{
				channelParams.eventChannels.set(event, channelId);
				channelParams.markModified("eventChannels");
				channelParams = await channelParams.save();
			}
			return { channelParams };
		}
		catch(error)
		{
			return { channelParams: null };
		}
	}

	async GetChannelParamsForGuild(guildId: string, leagueCode: KnownLeagueCodes) : Promise<LolChannelParamsResponse>
	{
		try
		{
			let channelParams = await LolChannelParams.findOne({guildId, leagueCode});
			return { channelParams };
		}
		catch(error)
		{
			return { channelParams: null };
		}
	}

	async GetAllChannelsParamsForLeague(leagueCode: KnownLeagueCodes) : Promise<MultipleLolChannelParamsResponse>
	{
		try
		{
			let channelParams = await LolChannelParams.find({leagueCode});
			return { channelParams };
		}
		catch(error)
		{
			return { channelParams:[] };
		}
	}

	async CreateChannelParamsForGuild(guildId: string, leagueCode: KnownLeagueCodes) : Promise<LolChannelParamsResponse>
	{
		try
		{
			let channelParams = new LolChannelParams({
				guildId,
				leagueCode,
				eventChannels: {}
			});
			channelParams = await channelParams.save();
			return { channelParams };
		}
		catch(error)
		{
			return { channelParams: null };
		}
	}
}

const lolChannelParamsController = new LolChannelParamsController();
export default lolChannelParamsController;