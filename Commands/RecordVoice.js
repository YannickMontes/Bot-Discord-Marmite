const Command = require('./Models/Command');
const recorder = require('../VoiceRecording/Recorder');

class RecordVoiceCommand extends Command
{
	isValidFormat(client, message, args)
	{
		let superResult = super.isValidFormat(client, message, args);
		if(superResult.error)
		{
			return superResult;
		}
		return {};
	}

	async execute(client, message, args)
	{
		try
		{
			let superResult = await super.execute(client, message, args);
			if(superResult.error)
			{
				return superResult;
			}
			const voiceChannel = message.member.voice.channel;
			if(!voiceChannel)
				return this.createErrorMessageObject(message, ` You must be in a voice channel !`);
			const permissions = voiceChannel.permissionsFor(message.client.user);
			if(!permissions.has('CONNECT') || !permissions.has('SPEAK'))
				return this.createErrorMessageObject(message, ` I don't have the correct permissions !`);

			if(recorder.isRecording(message.guild))
				return this.createErrorMessageObject(message, " I'm already recording someone else !");

			if(recorder.isUserRecording(message.guild, message.author))
				return this.createErrorMessageObject(message, " I'm already recording for you !");
			let voiceConnection = await voiceChannel.join();

			let recording = recorder.addRecording(message.guild, message.author, voiceConnection);

			await recording.startRecording(async(mp3FilePath) => {
				voiceConnection.disconnect();

				let embedMsg = GetEmbed(message.author, voiceChannel);

				await message.channel.send(embed);
				await message.channel.send({
					files:[{
						attachment: mp3FilePath,
						name: `Voice message by ${message.author.username} | ${Date.now().toString()}.mp3`
					}]
				});
			});

			await message.channel.send("Starting recording...");

			return {};
		}
		catch(error)
		{
			if(client.voice.channel)
				client.voice.channel.leave();
			console.log(error);
			return super.createErrorMessageObject(message, `Error in record command: ${error}`);
		}
	}
}

function GetEmbed(user, voiceChannel) {
    return new MessageEmbed()
        .setTitle(`Voice Message from ${user.username}`)
        .setDescription(`Recorded in voice channel "${voiceChannel.name}"`)
        .setColor(0x57ddf2)
        .setAuthor(`${user.username}#${user.discriminator}`, user.displayAvatarURL())
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();
}

module.exports = new RecordVoiceCommand("record", "**record**", 0);