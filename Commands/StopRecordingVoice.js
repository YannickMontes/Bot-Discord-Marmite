const Command = require('./Models/Command');
const recorder = require('../VoiceRecording/Recorder');

class StopRecordingVoiceCommand extends Command
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

			let recording = recorder.isUserRecording(message.guild, message.author);
			if(!recording)
				return this.createErrorMessageObject(message, " I'm not recording anything for you !");

			await recording.stopRecording();
			return {};
		}
		catch(error)
		{
			if(client.voice.channel)
				client.voice.channel.leave();
			console.log(error);
			return super.createErrorMessageObject(message, `Error in stoprecord command: ${error}`);
		}
	}
}

module.exports = new StopRecordingVoiceCommand("stoprecord", "**stoprecord**", 0);