import { CommandInteraction, EmbedBuilder, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
import { getEmojiCodeForAlphabetIndex, getRegionalIndicatorForAlphabetIndex } from "../../utils";

export const command: SlashCommand = {
	name: "poll",
	data: CreateCommandBuilder(),
	execute: async (interaction: CommandInteraction) =>
	{
		await interaction.deferReply();
		const question = interaction.options.get("question")?.value as string;
		let description = "";
		let nbResponses = 0;
		for(let i=0; i<9; i++)
		{
			const responseParam = interaction.options.get(`option${i+1}`);
			if(!responseParam)
				continue;
			description += `${getRegionalIndicatorForAlphabetIndex(i)} ${responseParam.value as string} ${i<8 ? "\n" : ""}`;
			nbResponses++;
		}

		const pollEmbed = new EmbedBuilder()
			.setColor("Random")
			.setTitle(question)
			.setDescription(description)
			.setTimestamp()
			.setAuthor({name: interaction.user.username + " asked", iconURL: interaction.user.avatarURL() as string});

		try
		{
			await interaction.editReply({embeds: [pollEmbed]});
			const message = await interaction.fetchReply();
			for(let i =0; i<nbResponses; i++)
			{
				let emojiCode = getEmojiCodeForAlphabetIndex(i);
				await message.react(emojiCode);
			}
		}
		catch(error)
		{
			console.log(error);
		}
	}
}

function CreateCommandBuilder(): SlashCommandBuilder
{
	let builder = new SlashCommandBuilder()
		.setName("poll")
		.setDescription("Create a poll with the given options")
		.addStringOption(option =>
			option
				.setName("question")
				.setDescription("The question of the poll")
				.setRequired(true)) as SlashCommandBuilder;
	builder = AddOptionalPollOptions(builder);
	return builder;
}

function AddOptionalPollOptions(builder: SlashCommandBuilder): SlashCommandBuilder
{
	for(let i=0; i<9; i++)
	{
		builder = builder.addStringOption(option =>
			option
				.setName(`option${i+1}`)
				.setDescription(`Option ${i+1} for the poll`)
				.setRequired(i < 2)) as SlashCommandBuilder;
	}
	return builder;
}