import { model, Schema } from "mongoose";

export interface ITrigger
{
	triggerPhrase: string,
	whatToTrigger: string,
	nbUse: number,
	nbUseWho: Map<string, number>,
	guildId: string,
}

export interface ITriggerUpdate
{
	triggerPhrase?: string,
	whatToTrigger?: string
}

const TriggerSchema = new Schema<ITrigger>({
	triggerPhrase: {
		type: String, 
		required: true,
		unique: true
	},
	whatToTrigger:{
		type: String,
		required: true
	},
	nbUse:{
		type: Number,
		required: true
	},
	nbUseWho:{
		type: Map,
		of: Number,
		required: true,
		default: {}
	},
	guildId:
	{
		type:String,
		required: true
	}
}, { minimize: false });

const Trigger = model<ITrigger>('Trigger', TriggerSchema);
export default Trigger;