let currentRecordings = [];
const path = require('path');
const fs = require('fs');
const Lame = require("node-lame").Lame;
const recordingFolder = path.join(__dirname, '..', '/recordings');

class Recording
{
	constructor(guild, user, voiceConnection)
	{
		this.guild = guild;
		this.user = user;
		this.voiceConnection = voiceConnection;
	}

	async startRecording(callbackOnRecorded)
	{
		this.filePath = recordingFolder + `/${this.user.id}-${Date.now()}.pcm`;
		this.filePathmp3 = this.filePath.replace('.pcm', '.mp3');

		let audioStream = await this.voiceConnection.receiver.createStream(this.user, {mode: 'pcm', end:'manual'});
		this.audioStream = audioStream;

		const mp3FileStream = await fs.createWriteStream(this.filePath, {flags: "w"});
		audioStream.pipe(mp3FileStream);

		audioStream.on('close', () => {
			this.saveRecording(callbackOnRecorded);
		});

		this.timeout = setTimeout(async() => {
			this.saveRecording(callbackOnRecorded);

			if (this.guild && this.guild.me.voice && this.guild.me.voice.channel) {
				await this.guild.me.voice.channel.leave();
			}

			currentRecordings.splice(currentRecordings.indexOf(this), 1);
			
			delete this;
		}, 1000 * 60);
	}
	
	async stopRecording()
	{
		currentRecordings.splice(currentRecordings.indexOf(this), 1);
		await this.audioStream.destroy();

		if(this.timeout)
			clearTimeout(this.timeout);

		delete this;
	}

	async saveRecording(callback)
	{
		const encoder = new Lame({
			output: this.filePathmp3,
			raw: true,
			bitrate: 192,
			scale: 3,
			sfreq: 48
		}).setFile(this.filePath);
		
		try
		{
			await encoder.encode();

			await fs.unlinkSync(this.filePath);

			await callback(this.filePathmp3);

			await fs.unlinkSync(this.filePathmp3);
		}
		catch(error)
		{
			console.error(error);
		}
	}
}

function isUserRecording(guild, user)
{
	for(let record of currentRecordings)
	{
		if(record.user.id == user.id
			&& record.guild.id == guild.id)
			return record;
	}
	return null;
}

function isRecording(guild)
{
	for(let record of currentRecordings)
	{
		if(record.guild.id == guild.id)
			return true;
	}
	return false;
}

function addRecording(guild, user, voiceConnection)
{
	let recording = new Recording(guild, user, voiceConnection);
	currentRecordings.push(recording);
	return recording;
}

module.exports = {
	addRecording,
	isUserRecording,
	isRecording,
	Recording
};