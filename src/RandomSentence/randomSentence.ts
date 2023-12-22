import fs from "fs";
import { getRandomInt } from "../utils";

let randomSentences: string[] = [];
fs.readFile('./DB/randomSentences', 'utf8', (err, data) => {
	randomSentences = data.split("\n");
	console.log(`Random sentences inited. Count: ${randomSentences.length}`);
});

export function getRandomSentence()
{
	return randomSentences[getRandomInt(randomSentences.length -1)];
}
