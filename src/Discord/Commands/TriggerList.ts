import { CommandInteraction, EmbedBuilder, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { getAllTriggers } from "../../Database/Controllers/triggerController";
import { ITrigger } from "../../Database/Models/TriggerModel";
import { SlashCommand } from "../../types";
import { getUserMentionFromId } from "../../utils";


export const command: SlashCommand = {
	name: "triggerlist",
	data: new SlashCommandBuilder()
		.setName("triggerlist")
		.setDescription("Get all the triggers Marmite knows for the current guild."),
	execute: async (interaction: CommandInteraction) => 
	{
		await interaction.deferReply();
		let allTriggersResponse = await getAllTriggers(interaction.guildId as string);
		if(allTriggersResponse.error || !allTriggersResponse.trigger)
		{
			await interaction.editReply(":x: Something went wrong: " + allTriggersResponse.error);
			return;
		}
		let allTriggers = (allTriggersResponse.trigger as ITrigger[]);
		let description = allTriggers.length > 0 ? "" : "There is no trigger on this server.";
		allTriggers.sort((trigger1, trigger2) => trigger1.nbUse - trigger2.nbUse);
		allTriggers.forEach(trigger => {
			let maxUseUser = null;
			let maxUse = -1;
			if(trigger.nbUseWho != null)
			{
				trigger.nbUseWho.forEach((userUse, user) => {
					if(userUse > maxUse)
					{
						maxUse = userUse;
						maxUseUser = user;
					}
				})
			}
			description += `**Trigger:** ${trigger.triggerPhrase} (${trigger.nbUse})`;
			if(maxUseUser != null)
			{
				description += ` *${getUserMentionFromId(maxUseUser)} premier avec ${maxUse}*`;
			}
			description += "\n";
		});
		let embed = new EmbedBuilder()
			.setColor("Random")
			.setTitle("**Trigger List**")
			.setDescription(description)
			.setAuthor({name: `${interaction.client.user.username} triggers (only here)`, iconURL: interaction.client.user.avatarURL() as string});
		await interaction.editReply({embeds: [embed]});
	}
}