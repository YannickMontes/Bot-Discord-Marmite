import { model, Schema } from "mongoose";

export interface ICounter
{
	name: string,
	who: Map<string, number>,
	totalUse: number,
	guildId: string
}

const CounterSchema = new Schema<ICounter>({
	name: {
		type: String, 
		required: true,
		unique: true
	},
	who:{
		type:Map,
		of: Number,
		required: true
	},
	totalUse:
	{
		type:Number,
		required:true
	},
	// guildId:
	// {
	// 	type:String,
	// 	required: true
	// }
}, { minimize: false });

const Counter = model<ICounter>('Counter', CounterSchema);
export default Counter;