import {AudioResource, createAudioResource} from "@discordjs/voice";
import youtube from "youtube-sr";
import {stream, video_basic_info} from "play-dl";

const pattern = /^(https?:\/\/)?(www\.)?(m\.|music\.)?(youtube\.com|youtu\.?be)\/.+$/;
const isURL = /^https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export interface SongData {
	url: string;
	title: string;
	duration: number;
}

export class Song {
	public readonly url: string;
	public readonly title: string;
	public readonly duration: number;

	public constructor({url, title, duration}: SongData) {
		this.url = url;
		this.title = title;
		this.duration = duration;
	}

	public static async from(url = "", search = "") {
		const isYoutubeUrl = pattern.test(url);
		if (isYoutubeUrl) {
			const songInfo = await video_basic_info(url);

			return new this({
				url: songInfo.video_details.url,
				title: songInfo.video_details.title!,
				duration: Math.floor(songInfo.video_details.durationInSec),
			});
		} else {
			const result = await youtube.searchOne(search);

			result || console.log(`No results found for ${search}`); // This is for handling the case where no results are found (spotify links for example)

			if (!result) {
				const err = new Error(`No search results found for ${search}`);
				err.name = "NoResults";
				if (isURL.test(url)) {
					err.name = "InvalidURL";
				}

				throw err;
			}

			const songInfo = await video_basic_info(`https://youtube.com/watch?v=${result.id}`);

			return new this({
				url: songInfo.video_details.url,
				title: songInfo.video_details.title!,
				duration: Math.floor(songInfo.video_details.durationInSec),
			});
		}
	}

	public async makeResource(): Promise<AudioResource<Song> | void> {
		const playStream = await stream(this.url);

		return createAudioResource(playStream.stream, {
			metadata: this,
			inputType: playStream.type,
			inlineVolume: true,
		});
	}

	public startMessage() {
		return `🎶 **Started playing:** ${this.title} ${this.url}`;
	}
}
