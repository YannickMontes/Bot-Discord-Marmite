import { HydratedDocument } from "mongoose";
import { getCounter } from "../Database/Controllers/counterController";
import { getTriggerByTriggerPhrase } from "../Database/Controllers/triggerController";
import { ICounter } from "../Database/Models/CounterModel";
import { ITrigger } from "../Database/Models/TriggerModel";
import { getRandomInt } from "../utils";

let thresholds = [{threshold: 1, sentences: ["Youhou, ce trigger/compteur est enfin utilisé :tada: !",
											"Première utilisation. GG à toooouus. Soooouuus.",
											"Wow, such utilisation, much wow (1 utilisation)."]},
				{threshold: 25, sentences:["Boh c'est un p'tit trigger/compteur zeps quoi (25 fois)",
										"Allez ce trigger/compteur commence à être cleanz (25 fois)"]},
				{threshold: 50, sentences:["Ok 50 fois OK ?? OUAIS ???"]},
				{threshold: 100, sentences:["Human centipède utilisation du trigger/compteur"]},
				{threshold: 150, sentences:["Ce trigger/compteur est désormais ajouté au langage courant. (150)"]},
				{threshold: 200, sentences:["2x100 - 5x20 - 100 = 0"]},
				{threshold: 250, sentences:["250... ça fait beaucoup là non ?"]},
				{threshold: 500, sentences:["Ok je vais exercer des CALMEZ-VOUS pour ce trigger/compteur. (500)",
											"Les fréros faut se calmer là (500 fois)"]}];

export async function getTriggerThresholdSentence(guildId: string, trigger: string)
{
	let triggerRes = await getTriggerByTriggerPhrase(guildId, trigger);
	let triggerDB: HydratedDocument<ITrigger> = triggerRes.trigger as HydratedDocument<ITrigger>;
	let sentence = null;
	thresholds.forEach(threshold => {
		if(threshold.threshold == triggerDB.nbUse)
		{
			sentence = threshold.sentences[getRandomInt(threshold.sentences.length - 1)];
		}
	});
	return sentence;
}

export async function getBanwordThresholdSentence(banword: string)
{
	let counterRes = await getCounter(banword);
	let counterBD: HydratedDocument<ICounter> = counterRes.counter as HydratedDocument<ICounter>;
	let sentence = null;
	thresholds.forEach(threshold => {
		if(threshold.threshold == counterBD.totalUse)
		{
			sentence = threshold.sentences[getRandomInt(threshold.sentences.length - 1)];
		}
	});
	return sentence;
}