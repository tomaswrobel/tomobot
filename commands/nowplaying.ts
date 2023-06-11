import {EmbedBuilder} from "discord.js";
import {splitBar} from "string-progressbar";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "Show now playing song",
		cooldown: 10,
	},
	async function* () {
		const queue = this.client.queues.get(this.guild!.id);

		if (!queue || !queue.songs.length) {
			yield {
				content: "There is nothing playing.",
				ephemeral: true,
			};
			return;
		}

		const [song] = queue.songs;
		const seek = queue.resource.playbackDuration / 1000;
		const left = song.duration - seek;

		const nowPlaying = new EmbedBuilder()
			.setTitle("Now playing")
			.setDescription(`${song.title}\n${song.url}`)
			.setColor("#F8AA2A");

		if (song.duration > 0) {
			nowPlaying.addFields({
				name: "\u200b",
				value:
					new Date(seek * 1000).toISOString().substr(11, 8) +
					"[" +
					splitBar(song.duration == 0 ? seek : song.duration, seek, 20)[0] +
					"]" +
					(song.duration == 0
						? " ◉ LIVE"
						: new Date(song.duration * 1000).toISOString().substr(11, 8)),
				inline: false,
			});

			nowPlaying.setFooter({
				text: `Time remaining: ${new Date(left * 1000).toISOString().slice(11, 8)}`,
			});
		}

		yield {embeds: [nowPlaying]};
	}
);
