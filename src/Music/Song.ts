import yts, { VideoSearchResult } from "yt-search";

class Song
{
	title = '';
	url = '';

	async init(songToSearch: string)
	{
		let urlRegex = /(https?|ftp|ssh|mailto):\/\/[a-z0-9\/:%_+.,#?!@&=-]+/;
		if(urlRegex.test(songToSearch.trim()))
		{
			this.url = songToSearch.trim();
			this.title = 'Your link';
		}
		else
		{
			let video = await this.findVideo(songToSearch) as VideoSearchResult;
			if(video != null)
			{
				this.url = video.url;
				this.title = video.title;
			}
			else
			{
				console.log(`Can't init correctly the Song because there is no result for this ytsearch: ${songToSearch} !`);
			}
		}
	}

	async findVideo(query: string): Promise<VideoSearchResult | null>
	{
		const videoResult = await yts(query);
		return (videoResult.videos.length > 0) ? videoResult.videos[0] : null;
	}
}

export default Song;