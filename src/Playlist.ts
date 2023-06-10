import youtube, {Playlist as YoutubePlaylist} from "youtube-sr";
import {config} from "../utils/config";
import {Song} from "./Song";

const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/i;

export class Playlist {
	public videos: Song[];

	public constructor(public data: YoutubePlaylist) {
		this.videos = this.data.videos
			.filter(video => video.title != "Private video" && video.title != "Deleted video")
			.slice(0, config.MAX_PLAYLIST_SIZE - 1)
			.map(video => {
				return new Song({
					title: video.title!,
					url: `https://youtube.com/watch?v=${video.id}`,
					duration: video.duration / 1000,
				});
			});
	}

	public static async from(url: string = "", search: string = "") {
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
