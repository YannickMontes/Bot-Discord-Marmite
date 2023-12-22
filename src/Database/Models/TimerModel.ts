import { model, Schema } from "mongoose";

export interface ITimer
{
	name: string,
	timer: number,
	active: boolean,
	guildId: string
}

const TimerSchema = new Schema<ITimer>({
	name: {
		type: String, 
		required: true,
		unique: true
	},
	timer:{
		type: Number,
		required: true
	},
	active:{
		type: Boolean,
		required: true
	},
	// guildId:
	// {
	// 	type:String,
	// 	required: true
	// }
});

const Timer = model<ITimer>('Timer', TimerSchema);
export default Timer;