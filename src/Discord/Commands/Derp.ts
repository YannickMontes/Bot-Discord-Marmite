import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";


export const command: SlashCommand = {
	name: "derp",
	data: new SlashCommandBuilder()
		.setName("derp")
		.setDescription("Derp the sentence you said")
		.addStringOption(option => 
			option
				.setName("toderp")
				.setDescription("The phrase to derp")
				.setRequired(true)) as SlashCommandBuilder,
	execute: async (interaction: CommandInteraction) => 
	{
		let toDerp = interaction.options.get("toderp")?.value as string;

		let startWithMaj = Math.random() > 0.5;
		let derpPhrase = startWithMaj ? toDerp[0].toUpperCase() : toDerp[0].toLowerCase();
		for(let i=1; i <toDerp.length; i++)
		{
			derpPhrase += i % 2 == 0 
				? (startWithMaj ? toDerp[i].toUpperCase() : toDerp[i].toLowerCase())
				: (startWithMaj ? toDerp[i].toLowerCase() : toDerp[i].toUpperCase()); 
		}

		await interaction.reply(`${derpPhrase}\nhttps://i.imgflip.com/1pi6nv.jpg`);
	}
}