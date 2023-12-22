import { BotEvent } from "../../types";
import { Events, GuildMember, Message, TextChannel } from "discord.js";
import { getUserMentionFromId } from "../../utils";

const event: BotEvent = {
	name: Events.GuildMemberAdd,
	once: false,
	execute(guildMember: GuildMember) {
		if(process.env.RESTRICTED_MODE == 1)
			return;
		let memberRole = guildMember.guild.roles.cache.find(role => role.name === process.env.MEMBER_ROLE);
		if(memberRole != null)
			guildMember.roles.add(memberRole);
		if(process.env.WELCOME_CHANNEL_NAME)
			(guildMember.guild.channels.cache.find(channel => channel.name === process.env.WELCOME_CHANNEL_NAME) as TextChannel)
				?.send(`Bienvenue ${getUserMentionFromId(guildMember.id)} ! \nPense bien à lire les règles du serveur.`);
	},
}

export default event;