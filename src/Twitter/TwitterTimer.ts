import { Client, TextChannel } from "discord.js";
import { HydratedDocument } from "mongoose";
import ITimerResponse, { getTimerByName } from "../Database/Controllers/timerController";
import { ITimer } from "../Database/Models/TimerModel";
import { TwitterHandler } from "./TwitterHandler";

export class TwitterTimer
{
	name: string = "";
	accountId: string = "";
	channelId: string = "";
	isActive = false;
	currentTimer = 5;
	lastTweetId = null;
	intervalFunction: NodeJS.Timer | null = null;
	twitterHandler: TwitterHandler | null = null;

	constructor(name: string, accountId: string, channelId: string, twitterHandler: TwitterHandler)
	{
		this.name = name;
		this.accountId = accountId;
		this.channelId = channelId;
		this.twitterHandler = twitterHandler;
		console.log(`Twitter timer ${this.name} created.`);
	}

	async checkTimer(discordClient: Client)
	{
		let timerRes:ITimerResponse = await  getTimerByName(this.name);
		if(timerRes.timer != null)
		{
			let timerDoc: HydratedDocument<ITimer> = timerRes.timer as HydratedDocument<ITimer>;
			this.isActive = timerDoc.active;
			this.currentTimer = timerDoc.timer;
			if(this.intervalFunction != null)
			{
				clearInterval(this.intervalFunction);
			}
			if(this.isActive)
			{
				this.intervalFunction = setInterval(() => this.sendLastTweetToChannel(discordClient), this.currentTimer);
			}
		}
		else
		{
			console.log("Can't find timer !");
		}
	}

	sendLastTweetToChannel(discordClient: Client)
	{
		this.twitterHandler?.client.get(
			"statuses/user_timeline"
			, {user_id: this.accountId, exclude_replies:true, include_rts:false, count: 1}
			, (error, data, response) => 
			{
				let tweet = data[0];
				if(tweet != null && this.lastTweetId != tweet.id_str)
				{
					console.log(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
					(discordClient?.channels.cache.get(this.channelId) as TextChannel)?.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
					this.lastTweetId = tweet.id_str;
				}
			}
		);
	}
}