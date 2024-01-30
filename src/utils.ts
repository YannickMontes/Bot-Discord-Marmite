import { APIApplicationCommandOptionChoice, Colors, EmbedBuilder, Guild, User } from "discord.js";
import { KnownLeagueCodes, LeagueAPI, LoLEvent, MatchOutcome, StageSlug, TournamentStandingAPI } from "./LoL/LolAPItypes";

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

export function getChannelMentionFromid(id:string): string
{
	return `<#${id}>`;
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

export function GetSlashCommandsChoicesForEnum<T extends { [s: string]: unknown; } | ArrayLike<unknown>>(enumParam: T): APIApplicationCommandOptionChoice<string>[]
{
	let choices: APIApplicationCommandOptionChoice<string>[] = [];
	for (let enumValue of Object.values(enumParam)) 
	{
		// if(enumValue instanceof String)
			choices.push({ name: enumValue as string, value: enumValue as string });
	}
	return choices;
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

export function IsSameDay(date1: Date, date2: Date)
{
	return date1.getDate() === date2.getDate()
	 && date1.getMonth() === date2.getMonth()
	 && date1.getFullYear() === date2.getFullYear();
}

export function MakeDiscordEmbedsForEvents(events: LoLEvent[], leagueCode: KnownLeagueCodes, league: LeagueAPI) : EmbedBuilder[]
{
	let embeds: EmbedBuilder[] = [];
	if(events != null && events.length > 0)
	{
		for(let event of events)
		{
			if(event.state != "completed")
			{
				let embed = new EmbedBuilder()
					.setTitle(`${event.match.teams[0].code} - ${event.match.teams[1].code}`)
					.setDescription(`${GetNiceDate(event.startTime, true)}\n`)
					.setThumbnail(GetResizedImageURL(event.match.teams[0].image))
					.setImage(GetResizedImageURL(event.match.teams[1].image))
					.setColor(ConvertLeagueCodeToColor(leagueCode))
					.setAuthor({name: leagueCode.toUpperCase() + " - " + event.blockName, iconURL: league?.image})
					.setFooter({text: leagueCode.toUpperCase() + ` - Match ID: ${event.match.id}`, iconURL: league?.image})
					.setTimestamp(new Date(event.startTime))
				embeds.push(embed);
			}
			else
			{
				if(!event.match.teams[0].result || !event.match.teams[1].result)
					continue;
				let winnerCode = "";
				let result = "";
				if(event.match.teams[0].result?.outcome == MatchOutcome.Win)
				{
					winnerCode = event.match.teams[0].code;
					result = event.match.teams[0].result.gameWins + " - " + event.match.teams[1].result.gameWins;
				}
				else
				{
					winnerCode = event.match.teams[1].code;
					result = event.match.teams[1].result.gameWins + " - " + event.match.teams[0].result.gameWins;
				}
				let embed = new EmbedBuilder()
					.setTitle(`${event.match.teams[0].code} - ${event.match.teams[1].code}`)
					.setDescription(`||**${winnerCode} WIN (${result})**||\n`)
					.setThumbnail(GetResizedImageURL(event.match.teams[0].image))
					.setImage(GetResizedImageURL(event.match.teams[1].image))
					.setColor(ConvertLeagueCodeToColor(leagueCode))
					.setAuthor({name: leagueCode.toUpperCase() + " - " + event.blockName, iconURL: league?.image})
					.setFooter({text: leagueCode.toUpperCase() + ` - Match ID: ${event.match.id}`, iconURL: league?.image})
					.setTimestamp(new Date(event.startTime))
				embeds.push(embed);
			}
		}
	}
	return embeds;
}

export function GetTeamsOfStageInTournament(standings: TournamentStandingAPI, stageSlug: string)
{
	let teamCodes: string[] = [];
	for(let stage of standings.stages)
	{
		if(stage.slug != stageSlug)
			continue;
		for(let ranking of stage.sections[0].rankings)
		{
			for(let team of ranking.teams)
			{
				teamCodes.push(team.code);
			}
		}
	}
	return teamCodes;
}