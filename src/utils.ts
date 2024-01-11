import { APIApplicationCommandOptionChoice, Colors, Guild, User } from "discord.js";
import { KnownLeagueCodes, StageSlug } from "./LoL/LolAPItypes";

export const UNKNOWN_RANKING_CHAR = "?";

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

export function GetLeagueCodeSlashCommandChoices(): APIApplicationCommandOptionChoice<string>[] 
{
	let choices: APIApplicationCommandOptionChoice<string>[] = [];
	for (let enumValue of Object.values(KnownLeagueCodes)) 
	{
		choices.push({ name: enumValue, value: enumValue });
	}
	return choices;
}

export function GetStageSlashCommandChoices(): APIApplicationCommandOptionChoice<string>[] 
{
	let choices: APIApplicationCommandOptionChoice<string>[] = [];
	for (let enumValue of Object.values(StageSlug)) 
	{
		choices.push({ name: enumValue, value: enumValue });
	}
	return choices;
} 

export function EnsureRankingIsComplete(ranking: string[]): boolean {
	for (let rank of ranking) 
	{
		if (rank == UNKNOWN_RANKING_CHAR)
		 return false;
	}
	return true;
}

export function GetRankingDuplicates(ranking: string[]): string[]
{
	let duplicates = ranking.filter((item, index) => ranking.indexOf(item) !== index);
	return [...new Set(duplicates)];
}

export function MergeRankings(oldRanking: string[], newRanking: string[]): string[] {
	let mergedRanking: string[] = [];
	for (let i = 0; i < oldRanking.length; i++) {
		if (newRanking[i] != UNKNOWN_RANKING_CHAR)
			mergedRanking.push(newRanking[i]);
		else mergedRanking.push(oldRanking[i]);
	}
	return mergedRanking;
}

export function GetNiceDate(date: Date, displayHours: boolean)
{
	let test = new Date(date);
	let options: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: "2-digit"
	};

	if(!displayHours)
	{
		delete options.hour;
		delete options.minute;
	}

	let formattedDate = test.toLocaleString("fr-FR", options);
	return formattedDate;
}

export function GetResizedImageURL(url: string) : string
{
	let split = url.split("/");
	const imgixResizedUrl = `https://jnounstudio-306256138.imgix.net/${split[split.length -1]}?w=50&h=50`;
	return imgixResizedUrl;
}

export function ConvertLeagueCodeToColor(leagueCode: KnownLeagueCodes)
{
	switch(leagueCode)
	{
		case KnownLeagueCodes.LEC:
			return Colors.DarkGreen;
		case KnownLeagueCodes.LFL:
			return Colors.Red;
		case KnownLeagueCodes.LCS:
			return Colors.Aqua;
		case KnownLeagueCodes.LCK:
			return Colors.LightGrey;
		default:
			return Colors.Default;
	}
}