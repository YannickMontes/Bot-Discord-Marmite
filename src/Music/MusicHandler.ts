import Song from "./Song";
import ytdl from "ytdl-core";
import { TextChannel, VoiceChannel } from "discord.js";
import { joinVoiceChannel, AudioPlayer, createAudioResource, createAudioPlayer, AudioPlayerState, getVoiceConnection, AudioPlayerError } from '@discordjs/voice';

export enum EMusicCommandResult { PLAYING, PAUSED, QUEUED, SKIPPED, SLEEP, ERROR };


export interface SongOperationResult
{
	code: EMusicCommandResult,
	message: string
}

interface GuildMusicInfo
{
	voiceChannel: VoiceChannel,
	textChannel: TextChannel,
	songs: Song[],
	audioPlayer: AudioPlayer,
	currentSong: Song | undefined
}

class MusicHandler
{
	queue = new Map<string, GuildMusicInfo>();

	addToQueue(song: Song, guildId: string, voiceChannel: VoiceChannel, textChannel: TextChannel): SongOperationResult
	{
		let guildMusicInfo: GuildMusicInfo | undefined = this.queue.get(guildId);
		let added = false;
		if(!guildMusicInfo)
		{
			guildMusicInfo = {
				voiceChannel: voiceChannel,
				textChannel: textChannel,
				songs: [],
				audioPlayer: createAudioPlayer(),
				currentSong: undefined
			};
			let voiceConnection = joinVoiceChannel({
				channelId: voiceChannel.channelId,
				guildId: voiceChannel.guild.id,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator
			})
			voiceConnection.subscribe(guildMusicInfo.audioPlayer);
			guildMusicInfo.audioPlayer.on("stateChange", (oldState: AudioPlayerState, newState: AudioPlayerState) => {
				this.onAudioPlayerStateChanged(guildId, oldState, newState);
			});
			guildMusicInfo.audioPlayer.on("error", (error: AudioPlayerError) => {
				this.onAudioPlayerError(guildId, error);
			});
			this.queue.set(guildId, guildMusicInfo);
			added = true;
		}
		guildMusicInfo.songs.push(song);
		if(added)
		{
			this.playNextSong(guildId);
			return {code: EMusicCommandResult.PLAYING, message:`Playing ***${song.title}*** :musical_note: !`}; 
		}
		else
		{
			return {code: EMusicCommandResult.QUEUED, message:`Added ***${song.title}*** to queue !`};
		}
	}

	playNextSong(guildId: string): EMusicCommandResult
	{
		const guildQueue = this.queue.get(guildId);
		if(!guildQueue)
		{
			return EMusicCommandResult.ERROR;
		}

		const song = guildQueue.songs.shift();
		if(!song)
		{
			this.stop(guildId);
			return EMusicCommandResult.SLEEP; 
		}
		guildQueue.currentSong = song;
		const stream = ytdl(song.url, {filter: 'audioonly'});
		const audioResource = createAudioResource(stream);
		guildQueue.audioPlayer.play(audioResource);
		guildQueue.textChannel.send(`:musical_note: Now playing ***${song.title}*** !`);
		return EMusicCommandResult.SKIPPED;
	}

	skip(guildId: string): SongOperationResult
	{
		let result: EMusicCommandResult = this.playNextSong(guildId); 
		if(result == EMusicCommandResult.SLEEP || result == EMusicCommandResult.SKIPPED)
		{
			return {code: result, message: (result == EMusicCommandResult.SKIPPED ? ":track_next: Music skipped !" : "Skipped ! But nothing to play, I leave ! :zzz: ")};
		}
		else
		{
			return {code: EMusicCommandResult.ERROR, message: ":x: Error while skipping music !"};
		}
	}

	stop(guildId: string): SongOperationResult
	{
		const guildQueue = this.queue.get(guildId);
		if(guildQueue)
		{
			guildQueue.audioPlayer.stop();
			getVoiceConnection(guildId)?.destroy();
			this.queue.delete(guildId);
			return {code: EMusicCommandResult.SLEEP, message: "Alright, I go back to sleep :zzz:"};
		}
		else
		{
			return {code: EMusicCommandResult.ERROR, message: ":x: I'm not playing any music my friend !"};
		}
	}

	pause(guildId: string) : SongOperationResult
	{
		const guildQueue = this.queue.get(guildId);
		if(!guildQueue)
		{
			return {code: EMusicCommandResult.ERROR, message: ":x: I'm not playing any music my friend !"};
		}
		guildQueue.audioPlayer.stop();
		return {code: EMusicCommandResult.PAUSED, message: ":pause_button: Let's pause the music."};
	}

	resume(guildId: string) : SongOperationResult
	{
		const guildQueue = this.queue.get(guildId);
		if(!guildQueue)
		{
			return {code: EMusicCommandResult.ERROR, message: ":x: I'm not playing any music my friend !"};
		}
		guildQueue.audioPlayer.unpause();
		return {code: EMusicCommandResult.PAUSED, message: ":play_pause: Wwwweeeeeeeeeeeee music is live :musical_note:"};
	}

	onAudioPlayerStateChanged(guildId: string, oldState: AudioPlayerState, newState: AudioPlayerState)
	{
		console.log(`[GUILD ${guildId}] Audio Player changed from state ${oldState.status} to ${newState.status}`);
		if(oldState.status == "playing" && newState.status == "idle")
		{
			this.tryToPlayNextMusic(guildId);
		}
	}

	onAudioPlayerError(guildId:string, error: AudioPlayerError)
	{
		console.log(`[SERVER ${guildId}] Audio Player Error: `, error);
		let guildQueue = this.queue.get(guildId); 
		guildQueue?.textChannel?.send(`Something went wrong while playing next song: ${guildQueue.currentSong.title} 😦. Skipping it.`);
		this.tryToPlayNextMusic(guildId);
	}

	tryToPlayNextMusic(guildId: string)
	{
		let textChannel = this.queue.get(guildId)?.textChannel; 
		let playedNext = this.playNextSong(guildId);
		let msg = "";
		if(playedNext == EMusicCommandResult.SLEEP)
			msg = "No more music in queue buddies ! I go back to sleep :zzz:";
		if(msg != "") 
			textChannel?.send(msg);
	}
}

const musicHandler = new MusicHandler();
export default musicHandler;