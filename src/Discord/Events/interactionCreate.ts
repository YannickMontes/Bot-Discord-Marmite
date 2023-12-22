import { BotEvent } from "../../types.js";
import { Events, Interaction } from "discord.js";
import { checkIfUserIsMarmiteOwner } from "../../utils.js";

const event: BotEvent = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction: Interaction) 
	{
		if (!interaction.isChatInputCommand()) 
			return;

		let isUserAuthorized = checkIfUserIsMarmiteOwner(interaction.user, interaction.guild);
		if(!isUserAuthorized)
		{
			await interaction.reply({content: ":x: You can't use the bot because you're not authorized !"});
			return;
		}

		const command = interaction.client.slashCommands.get(interaction.commandName);

		if (!command) 
			return;

		if(command.restricted === true && process.env.RESTRICTED_MODE == 1)
		{
			await interaction.reply(`:x: Bot is actually in restricted mode, so you can't use this command !`);
			return;
		}

		await command.execute(interaction);
	},
}

export default event;