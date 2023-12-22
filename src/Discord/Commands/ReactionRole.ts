import { CommandInteraction, EmbedBuilder, Guild, MessageReaction, Role, SlashCommandBuilder, User } from "discord.js";
import { SlashCommand } from "../../types";

const PAIN_CHOC_EMOJI = '🥐';
const CHOCOLLATINE_EMOJI = '💩';

export const command: SlashCommand = {
	name: "reactionrole",
	data: CreateCommandBuilder(),
	execute: async (interaction: CommandInteraction) =>
	{
		let reactionEmbed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle('Est-ce que vous avez du goût ?')
			.setDescription(`C'est ici que tout se joue...\n${PAIN_CHOC_EMOJI} => Pain au chocolat\n${CHOCOLLATINE_EMOJI} => Chocolatine`)
			.setAuthor({name: `${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL() as string})
			.setTimestamp();

		await interaction.reply({embeds:[reactionEmbed]});
		let message = await interaction.fetchReply();
		await message.react(PAIN_CHOC_EMOJI);
		await message.react(CHOCOLLATINE_EMOJI);

		const filter = (reaction: MessageReaction, user: User) => {
			let filterValid = [PAIN_CHOC_EMOJI, CHOCOLLATINE_EMOJI].includes(reaction.emoji.name as string);
			return filterValid;
		};

		let reactionCollector = message.createReactionCollector({filter, dispose: true});

		reactionCollector.on("collect", async (reaction, user) => {
			let roleToAdd = GetEmojiFromReaction(reaction);
			await AddOrRemoveRoleForUser(user, roleToAdd, reaction.message.guild, true);
		});

		reactionCollector.on("remove", async (reaction, user) => {
			console.log("remove");
			let roleToRemove = GetEmojiFromReaction(reaction);
			await AddOrRemoveRoleForUser(user, roleToRemove, reaction.message.guild, false);
		});
	}
}

function CreateCommandBuilder(): SlashCommandBuilder
{
	let builder = new SlashCommandBuilder()
		.setName("reactionrole")
		.setDescription("Create a embed reactable to assign/remove roles when user reacts.")
	return builder;
}

function GetEmojiFromReaction(reaction: MessageReaction): Role | undefined
{
	const painChocRole = reaction.message.guild?.roles.cache.find(role => role.name === process.env.PAIN_CHOC_ROLE);
	const chocolatineRole = reaction.message.guild?.roles.cache.find(role => role.name === process.env.CHOCOLATINE_ROLE);
	reaction.message.guild
	if(reaction.emoji.name === PAIN_CHOC_EMOJI)
	{
		return painChocRole;
	}
	else if (reaction.emoji.name === CHOCOLLATINE_EMOJI)
	{
		return chocolatineRole;
	}
	return undefined;
}

async function AddOrRemoveRoleForUser(user: User, role: Role | undefined, guild: Guild | null, add: boolean)
{
	if(!role)
		return;
			
	let allMembers = await guild?.members.fetch();
	let guildMember = allMembers?.get(user.id);
	if(add)
		guildMember?.roles.add(role);
	else
		guildMember?.roles.remove(role);
}