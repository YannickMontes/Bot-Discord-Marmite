import { Client, CommandInteraction, Message } from "discord.js";
import Twitter from "twitter";
import { TwitterTimer } from "./TwitterTimer";

export class TwitterHandler
{
	NCATimer: TwitterTimer | null = null;
	NCHTimer: TwitterTimer | null = null;

	client = new Twitter({
		consumer_key: process.env.TWITTER_API_KEY,
		consumer_secret: process.env.TWITTER_API_SECRET_KEY,
		access_token_key: process.env.TWITTER_ACCESS_TOKEN,
		access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
	});

	async init(discordClient: Client)
	{
		if(process.env.NCH_CHANNEL && process.env.TWITTER_NCH_ID)
			this.NCHTimer = new TwitterTimer("nch", process.env.TWITTER_NCH_ID, process.env.NCH_CHANNEL, this);
		if(process.env.NCA_CHANNEL && process.env.TWITTER_NCA_ID)
			this.NCATimer = new TwitterTimer("nca", process.env.TWITTER_NCA_ID, process.env.NCA_CHANNEL, this);
		await this.checkTimers(discordClient);
		console.log("Twitter handler inited");
	}

	async checkTimers(discordClient: Client)
	{
		await this.NCHTimer?.checkTimer(discordClient);
		await this.NCATimer?.checkTimer(discordClient);
	}

	getDrama(interaction: CommandInteraction, trendParam: string, tweetParam: string)
	{
		this.client.get('trends/place', {id: process.env.WOEID_FRANCE}, (error, trends, response) => {
			let bestTrend = null;
			if(trendParam == 'best')
			{
				let maxVol = -1;
				trends[0].trends.forEach(trend => {
					if(trend.tweet_volume > maxVol)
					{
						bestTrend = trend;
						maxVol = trend.tweet_volume;
					}
				});
			}
			else
			{
				bestTrend = trends[0].trends[this.getRandomInt(trends[0].trends.length -1)];
			}
			this.client.get('search/tweets', {q: bestTrend.query, lang: 'fr', result_type:'popular', count:100}, (error, tweets, response) => {
				let bestTweet = null;
				if(tweetParam == 'best')
				{
					let bestImpressions = -1;
					tweets.statuses.forEach(tweet => {
						if(!tweet.retweeted_status)
						{
							let nbImpression = tweet.favorite_count + tweet.retweet_count;
							if(nbImpression > bestImpressions)
							{
								bestImpressions = nbImpression;
								bestTweet = tweet;
							}
						}
					});
				}
				else
				{
					bestTweet = tweets.statuses[this.getRandomInt(tweets.statuses.length - 1)];
				}
				
				let toSend = null;
				if(bestTweet)
				{
					toSend = `https://twitter.com/${bestTweet.user.screen_name}/status/${bestTweet.id_str}`;
				}
				else
				{
					toSend = "J'ai pas réussi désolé :'("
				}

				interaction.editReply(toSend);
			});
		});
	}

	getNch(message: Message, behavior: string)
	{
		console.log(behavior);
		if(behavior == "last")
		{
			this.client.get("statuses/user_timeline", {user_id: process.env.TWITTER_NCH_ID, exclude_replies:true, include_rts:false, count: 1}
			, (error, data, response) => {
				let tweet = data[0];
				console.log(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
				message.channel.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
			});
		}
		else if(behavior == "random")
		{
			this.client.get("statuses/user_timeline", {user_id: process.env.TWITTER_NCH_ID, exclude_replies:true, include_rts:false, count: 200}
			, (error, data, response) => {
				let tweet = data[this.getRandomInt(data.length-1)];
				console.log(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
				message.channel.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
			});
		}
	}

	getRandomInt(max: number)
	{
		return Math.floor(Math.random() * max);
	}
}

const TwitterHandlerInstance = new TwitterHandler();
export default TwitterHandlerInstance;