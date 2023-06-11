import {DiscordGatewayAdapterCreator, joinVoiceChannel} from "@discordjs/voice";
import {EmbedBuilder, PermissionsBitField, type TextChannel} from "discord.js";
import SlashCommand from "../src/SlashCommand";
import MusicQueue from "../src/MusicQueue";
import Playlist from "../src/Playlist";
import {Song} from "../src/Song";

export = new SlashCommand(
	{
		cooldown: 5,
		permissions: [
			PermissionsBitField.Flags.Connect,
			PermissionsBitField.Flags.Speak,
			PermissionsBitField.Flags.ManageMessages,
		],
		description: "Play a playlist from YouTube",
	},
	async function* (argSongName) {
		const guildMemer = this.guild!.members.cache.get(this.user.id);
		const {channel} = guildMemer!.voice;

		const queue = this.client.queues.get(this.guild!.id);

		if (!channel) {
			yield {
				content: "You need to join a voice channel first!",
				ephemeral: true,
			};
			return;
		}

		if (queue && channel.id !== queue.connection.joinConfig.channelId) {
			yield `You must be in the same channel as ${this.user.username}`;
		}

		try {
			var playlist = await Playlist.from(argSongName!.split(" ")[0], argSongName!);
		} catch (error) {
			return yield {
				content: "Playlist not found 🙁",
				ephemeral: true,
			};
		}

		if (queue) {
			queue.songs.push(...playlist.videos);
		} else {
			const newQueue = new MusicQueue({
				interaction: this,
				textChannel: this.channel! as TextChannel,
				connection: joinVoiceChannel({
					channelId: channel.id,
					guildId: channel.guild.id,
					adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
				}),
			});

			this.client.queues.set(this.guild!.id, newQueue);
			newQueue.songs.push(...playlist.videos);

			newQueue.enqueue(playlist.videos[0]);
		}

		yield {
			content: `<@${this.user.id}> Started a playlist`,
			embeds: [
				new EmbedBuilder()
					.setTitle(`${playlist.data.title}`)
					.setDescription(
						playlist.videos
							.map((song: Song, index: number) => `${index + 1}. ${song.title}`)
							.join("\n")
							.slice(0, 4095)
					)
					.setURL(playlist.data.url!)
					.setColor("#F8AA2A")
					.setTimestamp(),
			],
		};
	},
	{
		name: "playlist",
		description: "Playlist name or link",
		required: true,
		type: "String",
	}
);
