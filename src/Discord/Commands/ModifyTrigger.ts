import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { createTrigger, modifyTrigger } from "../../Database/Controllers/triggerController";
import { ITriggerUpdate } from "../../Database/Models/TriggerModel";
import { SlashCommand } from "../../types";


export const command: SlashCommand = {
	name: "modifytrigger",
	data: new SlashCommandBuilder()
		.setName("modifytrigger")
		.setDescription("Modify the knowlege of Marmite")
		.addStringOption(option => 
			option
				.setName("trigger")
				.setDescription("The trigger you want to modify")
				.setRequired(true))
		.addStringOption(option => 
			option
				.setName("newtrigger")
				.setDescription("The new phrase Marmite will react to")
				.setRequired(false))
		.addStringOption(option => 
			option
				.setName("newcontent")
				.setDescription("The new response Marmite will send you")
				.setRequired(false)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) => 
	{
		await interaction.deferReply();
		let trigger = interaction.options.get("trigger")?.value as string;
		let whatToTriggerParam = interaction.options.get("newcontent");
		let newTriggerPhraseParam = interaction.options.get("newtrigger");

		let modifyJson:ITriggerUpdate = { };
		if(newTriggerPhraseParam)
			modifyJson.triggerPhrase = newTriggerPhraseParam.value as string;
		if(whatToTriggerParam)
			modifyJson.whatToTrigger = whatToTriggerParam.value as string;

		console.log(modifyJson);
		let updatedTrigger = await modifyTrigger(interaction.guildId as string, trigger, modifyJson);
		console.log(updatedTrigger);
		if(updatedTrigger.error)
		{
			await interaction.editReply(`:x: Something went wrong on the trigger modification !`);
		}
		else if(updatedTrigger.trigger == null)
		{
			await interaction.editReply(`:x: There is no trigger called **${trigger}** !`);
		}
		else
		{
			await interaction.editReply(`:thumbsup: Trigger **${trigger}** successfully updated ! ${modifyJson.triggerPhrase != null ? `Now called **${modifyJson.triggerPhrase}**` : ""}`);
		}
	}
}