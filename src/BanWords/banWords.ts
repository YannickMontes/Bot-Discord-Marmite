import { Message } from "discord.js";
import fs from "fs";
import { increaseAllTimeBanWord, increaseCounterForUserAndBanWord } from "../Database/Controllers/counterController";
import { getBanwordThresholdSentence } from "../Triggers/triggerThreshold";

export const BAN_WORDS_EMOJIS = ["🚫", "⛔", "🛑", "❌", "📛", "🔞", "🔞"]

let allBanWords: string[] = [];

fs.readFile("./DB/banwords", 'utf8', (err, data) => {
	allBanWords = data.split("\n");
	console.log("Ban words loaded. Count: " + allBanWords.length);
});

export function getBanWordsInMessage(message: string)
{
	let words: string[] = [];
	let spltitedMessage = message.split(" ");
	spltitedMessage.forEach(wordInMessage => {
		if(wordInMessage.match(/<:.+?:\d+>/g))
		{
			let emojiName = wordInMessage.match(/\:([^\.]+)\:/g);
			if(emojiName != null && emojiName.length == 1 && allBanWords.includes(emojiName[0].toString()))
				words.push(emojiName[0]);
		}
		if(allBanWords.includes(wordInMessage))
			words.push(wordInMessage);
	});
	return words;
}

export async function checkBanWords(message:Message, lowerCaseMsg: string)
{
	let banWordsInMsg = getBanWordsInMessage(lowerCaseMsg);
	console.log(banWordsInMsg);
	if(banWordsInMsg.length > 0)
	{
		for(let banWord of banWordsInMsg)
		{
			await increaseCounterForUserAndBanWord(banWord, message.author.id);
			await increaseAllTimeBanWord(message.author.id);
			let sentence = await getBanwordThresholdSentence(banWord);
			if(sentence != null)
			{
				await message.channel.send(sentence);
			}
		}
		let i = 0;
		while(i < banWordsInMsg.length && i < BAN_WORDS_EMOJIS.length)
		{
			await message.react(BAN_WORDS_EMOJIS[i]);
			i++;
		}
		return true;
	}
	return false;
}