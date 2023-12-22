import { ActivityType, Client, PresenceStatusData } from "discord.js";
import { getRandomInt } from "../utils";

interface IActivity
{
	activity: string,
	statusType: Exclude<ActivityType, ActivityType.Custom>,
	status: PresenceStatusData,
	url?: string
}

const STATUSES: IActivity[] = [
	{
		activity: "Le temps des tempêtes, POUR AUDIBLE 📖",
		statusType: ActivityType.Listening,
		status: "idle"
	},
	{
		activity: "Le jeu du fel 🧂",
		statusType: ActivityType.Playing,
		status: "dnd"
	},
	{
		activity: "Jean-jacquesjaj Bourdin",
		statusType: ActivityType.Listening,
		status: "dnd"
	},
	{
		activity: "Combat pour la dure loi de l'honnêtemeb ✊",
		statusType: ActivityType.Competing,
		status: "dnd"
	},
	{
		activity: "[YTP FR]Nicolas Sarkozy - Le Come back",
		statusType: ActivityType.Watching,
		status: "dnd",
		url: "https://www.youtube.com/watch?v=_FHoPvyE3Qk"
	},
	{
		activity: "Distribuer des PLS",
		statusType: ActivityType.Playing,
		status: "invisible"
	},
	{
		activity: "Jaaaaaaj",
		statusType: ActivityType.Streaming,
		status: "online"
	}
];

export async function setupStatus(client: Client)
{
	pickRandomStatus(client);
	setInterval(() => {
		pickRandomStatus(client);
	}, process.env.STATUS_TIMER);
}

async function pickRandomStatus(client: Client)
{
	let status = STATUSES[getRandomInt(STATUSES.length-1)];
	console.log(`Changing status to ${status.activity}`);
	client.user?.setPresence({activities: [{name: status.activity, type: status.statusType}], status: status.status});
}