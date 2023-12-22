import { BotEvent } from "../../types";
import { Events, Message } from "discord.js";
import { checkBanWords, getBanWordsInMessage } from "../../BanWords/banWords";

const event: BotEvent = {
	name: Events.MessageUpdate,
	once: false,
	async execute(oldMessage: Message, newMessage: Message) {
		if(oldMessage.partial)
			return;
		let oldMessageLowerCase = oldMessage.content.toLowerCase();
		let newMessageLowerCase = newMessage.content.toLowerCase();
		let oldContainsBanWords =  getBanWordsInMessage(oldMessageLowerCase).length > 0;
		let newContainsBanWords = getBanWordsInMessage(newMessageLowerCase).length > 0;
		if(oldContainsBanWords && !newContainsBanWords)
		{
			await newMessage.reply(`Bah alors ? On gruge pour enlever un banword ? C'est raté.`);
		}
		if(!oldContainsBanWords && newContainsBanWords)
		{
			await checkBanWords(newMessage, newMessageLowerCase);
			await newMessage.reply(`T'as cru pouvoir m'avoir en rajoutant le banword après ? C'est non mon pote.`)
		}
	}
}

export default event;