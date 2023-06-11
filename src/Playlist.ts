import youtube, {Playlist as YoutubePlaylist} from "youtube-sr";
import {Song} from "./Song";

const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/i;

class Playlist {
	public videos: Song[];

	private constructor(public data: YoutubePlaylist) {
		this.videos = this.data.videos
			.filter(video => video.title != "Private video" && video.title != "Deleted video")
			.map(video => {
				return new Song({
					title: video.title!,
					url: `https://youtube.com/watch?v=${video.id}`,
					duration: video.duration / 1000,
				});
			});
	}

	public static async from(url = "", search = "") {
		const urlValid = pattern.test(url);

		if (urlValid) {
			var playlist = await youtube.getPlaylist(url);
		} else {
			const result = await youtube.searchOne(search, "playlist");
			var playlist = await youtube.getPlaylist(result.url!);
		}

		return new this(playlist);
	}
}

export default Playlist;