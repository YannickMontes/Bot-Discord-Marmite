import { Document, HydratedDocument, Query } from "mongoose";
import lolRankingController, { IWaitingRankings } from "../Database/Controllers/lolRankingController";
import lolAPIHandler, { IFinalRankingResult } from "../LoL/LolAPIHandler";
import LolRanking, { ILoLRanking, RankingState } from "../Database/Models/LolRanking";
import { KnownLeagueCodes, LeagueAPI, LoLEvent } from "../LoL/LolAPItypes";
import lolChannelParamsController from "../Database/Controllers/lolChannelParamsController";
import { ILolChannelParams, LolEventType } from "../Database/Models/LolChannelParams";
import client from "./client";
import { EmbedBuilder, TextChannel } from "discord.js";
import { MakeDiscordEmbedsForEvents } from "../utils";

export async function registerToNextMidnight()
{
	// SendTodaySchedule();
	let today = new Date();
	console.log(today);
	let tommorow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0);
	console.log(tommorow);

	const timeUntilMidnight = tommorow.getTime() - today.getTime();
	console.log(timeUntilMidnight);

	setTimeout(() => {
		OnMidnight();
	}, timeUntilMidnight);
}

registerToNextMidnight();

async function OnMidnight()
{
	SendTodaySchedule();
	registerToNextMidnight();
}

async function SendTodaySchedule()
{
	for(let leagueCode of Object.values(KnownLeagueCodes))
	{
		let { channelParams } = await lolChannelParamsController.GetAllChannelsParamsForLeague(leagueCode);
		if(channelParams.length == 0 )
			continue;

		let league = await lolAPIHandler.GetLeague(leagueCode);
		let today = new Date();

		let todaySchedule = await lolAPIHandler.GetDailySchedule(leagueCode, today);
		if(!todaySchedule || !league)
			continue;
	
		let yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0);
		let yesterdayResults = await lolAPIHandler.GetDailySchedule(leagueCode, yesterday);
		if(!yesterdayResults)
			continue;

		for(let channelParam of channelParams)
		{
			SendEventsToChannel(channelParam, LolEventType.SCHEDULE
				, todaySchedule, `**TODAY ${leagueCode.toUpperCase()} MATCHES !**`, league);

			SendEventsToChannel(channelParam, LolEventType.RESULTS
							, yesterdayResults, `**RECENT ${leagueCode.toUpperCase()} RESULTS !**`, league);
		}
	}
}

async function SendEventsToChannel(channelParam: HydratedDocument<ILolChannelParams>, eventType: LolEventType
	, events: LoLEvent[], beforePhrase: string, league: LeagueAPI)
{
	if(events.length <= 0)
		return;
	let chanId = channelParam.eventChannels.get(eventType);
	if(chanId)
	{
		let chan = client.channels.cache.get(chanId) as TextChannel;
		if(chan)
		{
			chan.send(beforePhrase);
			SendEmbeds(MakeDiscordEmbedsForEvents(events, league.slug as KnownLeagueCodes, league), chan);
		}
	}
}

async function SendEmbeds(embeds: EmbedBuilder[], channel:TextChannel)
{
	while(embeds.length > 0)
	{
		let sendEmbeds : EmbedBuilder[] = [];
		for(let i =0; i < 10 && embeds.length > 0; i++)
		{
			let embed: EmbedBuilder | undefined = embeds.shift();
			if(embed != null)
				sendEmbeds.push(embed);
		}
		channel.send({embeds: sendEmbeds});
	}
}

async function checkNewLolEvents()
{
	let waitingRankings = await lolRankingController.GetAllWaitingRankings();
	let finishedTournamentStagesPromises : Promise<boolean>[] = [];
	waitingRankings.forEach(waitingRankings => {
		finishedTournamentStagesPromises.push(lolAPIHandler.IsTournamentStageCompleted(waitingRankings.tournamentId, waitingRankings.tournamentStage));
	});
	let completedTournamentStages = await Promise.all(finishedTournamentStagesPromises);
	let waitingRankingsFinished: IWaitingRankings[] = [];
	for(let i= 0; i< completedTournamentStages.length; i++)
	{
		if(completedTournamentStages[i])
		{
			waitingRankingsFinished.push(waitingRankings[i]);
		}
	}

	if(waitingRankingsFinished.length > 0)
	{
		let finalRankingsPromises:Promise<IFinalRankingResult>[] = [];
		waitingRankingsFinished.forEach(waitingRanking => {
			finalRankingsPromises.push(lolAPIHandler.GetFinalRankingForTournamentStage(waitingRanking.tournamentId, waitingRanking.tournamentStage));
		});
		let finalRankings = await Promise.all(finalRankingsPromises);
		let allDocumentsSavePromises: any = [];//Promise<Document<ILoLRanking>>[] = [];
		for(let i = 0; i< waitingRankingsFinished.length; i++)
		{
			let finalRanking = finalRankings[i];
			waitingRankingsFinished[i].rankings.forEach(ranking => {
				let diffWithRealRanking = new Array<number>(ranking.ranking.length);
				for(let j=0; j<ranking.ranking.length; j++)
				{
					let difference = finalRanking.finalRanking.indexOf(ranking.ranking[j]) - j;
					diffWithRealRanking[j] = difference;
				}
				let state = RankingState.ENDED;
				let modifyPromise = LolRanking.findByIdAndUpdate(ranking.id, {diffWithRealRanking: diffWithRealRanking
					, state: state});
				allDocumentsSavePromises.push(modifyPromise);
			});
		}
		let allDocumentsSaved = await Promise.all(allDocumentsSavePromises);
	}
}