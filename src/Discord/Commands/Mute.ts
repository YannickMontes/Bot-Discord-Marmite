import { CommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
import { getUserMentionFromId } from "../../utils";


export const command: SlashCommand = {
	name: "mute",
	restricted: true,
	data: new SlashCommandBuilder()
		.setName("mute")
		.setDescription("Prevent the specified user to talk for the specified duration.")
		.addUserOption(option => 
			option
				.setName("user")
				.setDescription("The one who keeps talking sh**.")
				.setRequired(true))
		.addIntegerOption(option => 
			option
				.setName("duration")
				.setDescription("The duration of the mute")
				.setRequired(true)
				.addChoices(
					{name: "60 sec", value: 60000},
					{name: "5 min", value: 60000 * 5},
					{name: "10 min", value: 60000 * 10},
					{name: "1 hour", value: 60000 * 60},
					{name: "1 jour", value: 60000 * 60 * 24},
					{name: "1 semaine", value: 60000 * 60 * 24 * 7}
				))
		.addStringOption(option => 
			option
				.setName("reason")
				.setDescription("Is it because he talk too much, or something else ?")
				.setRequired(false)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) => 	
	{
		await interaction.deferReply();
		const userToMute: GuildMember = interaction.options.getMember("user") as GuildMember;
		const durationOption = interaction.options.get("duration", true);
		const duration = durationOption ? durationOption.value as number : null;
		const reasonOption = interaction.options.get("reason");
		const reason = reasonOption ? reasonOption.value as string : undefined;
		try
		{
			await userToMute.timeout(duration, reason);
			await interaction.editReply(`User ${getUserMentionFromId(userToMute.id)} will now shut up ${reason != null ? `because *"${reason}"*` : ''}.\nFinally, peace ! :zipper_mouth:`);
		}
		catch(error)
		{
			console.log(error);
		}
	}
}