import { BotEvent } from "../../types";
import { Client, Events, Message } from "discord.js";
import { getAllTriggers, increaseTriggerUse } from "../../Database/Controllers/triggerController";
import { ITrigger } from "../../Database/Models/TriggerModel";
import { canTrigger } from "../../Triggers/triggerHandler";
import {  getTriggerThresholdSentence } from "../../Triggers/triggerThreshold";
import { checkBanWords  } from "../../BanWords/banWords";
import { getRandomSentence } from "../../RandomSentence/randomSentence";

const event: BotEvent = {
	name: Events.MessageCreate,
	once: false,
	async execute(message: Message) {
		if(message.author.bot)
			return;

		await handleTriggers(message);
		await checkBanWords(message, message.content.toLowerCase());
		await checkMention(message, message.client);
		await checkTwitterLink(message);
	},
}


async function handleTriggers(message: Message)
{
	let messageContent = message.content.toLowerCase();
	let guildTriggersRes = await getAllTriggers(message.guildId as string);

	if(guildTriggersRes.error || guildTriggersRes.trigger == null)
		return;
		
	let guildTriggers = guildTriggersRes.trigger as ITrigger[];

	guildTriggers.forEach(async guildTrigger => {
		let canTriggerResult = canTrigger(messageContent, guildTrigger.triggerPhrase);
		if(canTriggerResult)
		{
			message.channel.send(guildTrigger.whatToTrigger);
			await increaseTriggerUse(message.guildId as string, guildTrigger.triggerPhrase, message.author.id);
			let sentence = await getTriggerThresholdSentence(guildTrigger.guildId, guildTrigger.triggerPhrase);
			console.log(sentence);
			if(sentence != null)
			{
				await message.channel.send(sentence);
			}
		}
	});
}

async function checkMention(message: Message, client: Client)
{
	if(message.mentions.users.size > 0)
	{
		let selfMention = message.mentions.users.get(client.user?.id as string);
		if(selfMention != null)
		{
			await message.channel.send(getRandomSentence());
		}
	}
}

async function checkTwitterLink(message: Message)
{
	let msg = message.content;
	let newMsg = msg.replace("https://twitter.com/", "https://vxtwitter.com/");
	newMsg = msg.replace("https://x.com/", "https://vxtwitter.com/");
	
	await message.channel.send(newMsg);
}

export default event;