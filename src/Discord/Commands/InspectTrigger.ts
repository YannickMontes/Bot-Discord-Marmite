import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getTriggerByTriggerPhrase } from "../../Database/Controllers/triggerController";
import { ITrigger } from "../../Database/Models/TriggerModel";
import { SlashCommand } from "../../types";
import { getUserMentionFromId } from "../../utils";


export const command: SlashCommand = {
	name: "inspecttrigger",
	data: new SlashCommandBuilder()
		.setName("inspecttrigger")
		.setDescription("Watch the knowlege of Marmite")
		.addStringOption(option => 
			option
				.setName("trigger")
				.setDescription("The phrase you want to see")
				.setRequired(true)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) => 
	{
		await interaction.deferReply();
		let trigger = interaction.options.get("trigger")?.value as string;
		let triggerRes = await getTriggerByTriggerPhrase(interaction.guildId as string, trigger);
		if(triggerRes.error || triggerRes.trigger == null)
		{
			await interaction.editReply(`:x: Can't retreive the trigger **${trigger}** !`);
			return;
		}
		let watchedTrigger = triggerRes.trigger as ITrigger;
		let embedDescription = `**Trigger Phrase:** ${watchedTrigger.triggerPhrase} \n**Trigger:** ${watchedTrigger.whatToTrigger} \nUtilisations totales: **${watchedTrigger.nbUse}**\n`;
		let nbUseSort: {user: string, nbUse: number}[] = [];
		watchedTrigger.nbUseWho.forEach((value, user) => {
			nbUseSort.push({user, nbUse: value});
		});
		nbUseSort.sort((nbUse1, nbUse2) => nbUse2.nbUse - nbUse1.nbUse);
		let first = true;
		nbUseSort.forEach(nbUse => {
			embedDescription += `\n*${getUserMentionFromId(nbUse.user)}: ${nbUse.nbUse} utilisations ${first ? ":crown:" : ""}*`;
			first = false;
		});
		let triggerInspect = new EmbedBuilder()
			.setTitle(`Trigger *${trigger}*`)
			.setAuthor({name: `${interaction.client.user.username} triggers (only here)`, iconURL: interaction.client.user.avatarURL() as string})
			.setColor("Random")
			.setDescription(embedDescription);
		await interaction.editReply({embeds: [triggerInspect]});
	}
}