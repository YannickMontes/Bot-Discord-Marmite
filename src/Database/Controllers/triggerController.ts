import { HydratedDocument } from "mongoose";
import Trigger, { ITrigger, ITriggerUpdate } from "../Models/TriggerModel";

export default interface ITriggerResponse 
{
	trigger?:  HydratedDocument<ITrigger> | HydratedDocument<ITrigger>[] | null,
	error?: unknown
}

export async function createTrigger(guildId: string, triggerPhrase: string, whatToTrigger: string): Promise<ITriggerResponse>
{
	try
	{
		const trigger: HydratedDocument<ITrigger> = new Trigger({
			triggerPhrase: triggerPhrase,
			whatToTrigger: whatToTrigger,
			nbUse: 0,
			nbUseWho: new Map(),
			guildId: guildId
		});
		await trigger.save();
		return {trigger:trigger};
	}
	catch(error: unknown)
	{
		console.log(error);
		return { error:error};
	}
}

export async function getAllTriggers(guildId: string) : Promise<ITriggerResponse>
{
	try
	{
		let triggers = await Trigger.find({guildId: guildId});
		return { trigger: triggers };
	}
	catch(error)
	{
		console.log(error);
		return { error:error };
	}
}

export async function getTriggerByTriggerPhrase(guildId: string, triggerPhrase: string): Promise<ITriggerResponse>
{
	try
	{
		let trigger = await Trigger.findOne({guildId: guildId, triggerPhrase: triggerPhrase});
		return { trigger: trigger};
	}
	catch(error)
	{
		console.log(error);
		return {error:error};
	}
}

export async function increaseTriggerUse(guildId: string, triggerPhrase: string, authorId: string): Promise<ITriggerResponse>
{
	try
	{
		let triggerRes = await getTriggerByTriggerPhrase(guildId, triggerPhrase);
		let trigger = triggerRes.trigger as HydratedDocument<ITrigger>;
		if(!trigger)
			return {error: "Not found"};
		console.log("Before use trigger save", trigger);
		if(trigger.nbUseWho == null)
		{
			trigger.nbUseWho = new Map();
		}
		let nb = 1;
		if(trigger.nbUseWho.has(authorId))
		{
			nb = trigger.nbUseWho.get(authorId) as number + 1;
		}
		trigger.nbUseWho.set(authorId, nb);
		trigger.nbUse++;
		trigger.markModified("nbUseWho");
		await trigger.save();
		console.log("After use trigger save", trigger);
		return {trigger: trigger};
	}
	catch(error)
	{
		console.log(error);
		return {error:error};
	}
}

export async function modifyTrigger(guildId:string, triggerPhrase: string, updateJson: ITriggerUpdate)
{
	try
	{
		let trigger = await Trigger.findOneAndUpdate({guildId: guildId, triggerPhrase: triggerPhrase}, updateJson, {new: true});
		return {trigger: trigger};
	}
	catch(error)
	{
		console.log(error);
		return {error:error};
	}
}

export async function deleteTrigger(guildId: string, triggerPhrase: string): Promise<ITriggerResponse>
{
	try
	{
		let trigger = await Trigger.findOneAndDelete({guildId: guildId, triggerPhrase: triggerPhrase});
		return {trigger: trigger};
	}
	catch(error)
	{
		console.log(error);
		return {error:error};
	}
}

export async function updateAllTriggers(guildId: string)
{
	// let allTriggers = await Trigger.find();
	// allTriggers.forEach(async trigger => {
	// 	trigger.guildId = guildId;
	// 	if(!trigger.nbUseWho)
	// 		{
	// 			trigger.nbUseWho = new Map();
	// 			trigger.markModified('nbUseWho');
	// 			console.log(trigger);
	// 		}
	// 		else
	// 		{
	// 			await trigger.save()

	// 		}
	// });
}