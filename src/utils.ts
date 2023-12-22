import { Guild, User } from "discord.js";

export function getUserFromMention(
	client: any,
	mention: string
  ): any 
{
	const matches = mention.match(/^<@!?(\d+)>$/);
	if (!matches) return;
	const id = matches[1];
	return client.users.cache.get(id);
}

export function getUserIdFromMention(mention: string): string 
{
	const matches = mention.match(/^<@!?(\d+)>$/);
	if (!matches) return "";
	let id = matches[1];

	if (id.startsWith("!")) return id.substring(1);
	return id;
}

export function getUserMentionFromId(id: string): string
{
	return `<@!${id}>`;
}

export function isNullOrEmpty(string: string): boolean 
{
	return !string || string.length === 0;
}

export function removeBeginingAndEndingSpaces(string: string): string 
{
	if (!string) return "";
	while (string.startsWith(" ")) {
		string = string.slice(1, string.length);
	}
	while (string.endsWith(" ")) {
		string = string.slice(0, -1);
	}
	return string;
}

export function getRegionalIndicatorForAlphabetIndex(alphabetIndex: number)
{
	if(alphabetIndex < 0 && alphabetIndex > 25)
		return `:x:`;
	return `:regional_indicator_${String.fromCharCode(97 + alphabetIndex)}:`;
}

export function getEmojiCodeForAlphabetIndex(alphabetIndex: number)
{
	let emojiCode = String.fromCodePoint((String.fromCharCode(97 + alphabetIndex).codePointAt(0) as number) - 97 + 0x1f1e6)
	return emojiCode;
}

export function getRandomInt(max: number) 
{
	return Math.floor(Math.random() * max);
}

export async function checkIfUserIsMarmiteOwner(user: User, guild: Guild | null)
{
	let allmembers = await guild?.members.fetch();
	let member = allmembers?.get(user.id);
	let role = member?.roles.cache.find(role => role.name == process.env.OWNER_ROLE_NAME);
	return role != undefined;
}