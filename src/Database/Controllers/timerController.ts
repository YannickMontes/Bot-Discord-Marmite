import { HydratedDocument } from "mongoose";
import Timer, { ITimer } from "../Models/TimerModel";

export default interface ITimerResponse
{
	timer?: HydratedDocument<ITimer> | HydratedDocument<ITimer>[] | null,
	error?: unknown 
} 

export async function getTimerByName(timerName: string):  Promise<ITimerResponse>
{
	try
	{
		Timer
		let timer = await Timer.findOne({name: timerName});
		return {timer: timer};
	}
	catch(error)
	{
		console.log(error);
		return {error:error};
	}
}

export async function updateTimer(timerName: string, updateJson: object):  Promise<ITimerResponse>
{
	try
	{
		let timer = await Timer.findOneAndUpdate({name: timerName}, updateJson, {new: true});
		return {timer: timer};
	}
	catch(error)
	{
		console.log(error);
		return {error:error};
	}
}

export async function getAllTimers() : Promise<ITimerResponse>
{
	try
	{
		let timers = await Timer.find();
		return {timer:timers};
	}
	catch(error)
	{
		console.log(error);
		return {error:error };
	}
}