import { HydratedDocument } from "mongoose";
import Counter, { ICounter } from "../Models/CounterModel";

export default interface ICounterResponse
{
	counter?: HydratedDocument<ICounter> | HydratedDocument<ICounter>[] | null,
	error?: unknown
}

export async function increaseCounterForUserAndBanWord(banWord: string, userId: string) : Promise<ICounterResponse>
{
	try
	{
		let counter = await Counter.findOne({name: banWord});
		if(counter == null)
		{
			counter = new Counter({
				name: banWord,
				who: {},
				totalUse: 0
			});
			counter = await counter.save();
		}
		let nb = 1;
		if(counter.who.has(userId))
		{
			nb = counter.who.get(userId) as number + 1;
		}
		counter.who.set(userId, nb);
		counter.markModified("who");
		counter.totalUse++;
		await counter.save();
		return {counter: counter};
	}
	catch(error)
	{
		console.log(error);
		return {error:error};
	}
}

export async function increaseAllTimeBanWord(userId: string)
{
	await increaseCounterForUserAndBanWord(process.env.ALL_TIME_BANWORDS, userId);
}

export async function getCounter(name: string)
{
	try
	{
		let counter = await Counter.findOne({name: name});
		return {counter};
	}
	catch(error)
	{
		console.log(error);
		return {counter: null, error};
	}
}

export async function getAllCounters(guildId: string)
{
	try
	{
		let counters = await Counter.find({guildId: guildId});
		return {counters};
	}
	catch(error)
	{
		console.log(error);
		return {counters: null, error};
	}
}