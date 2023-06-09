import {DiscordGatewayAdapterCreator, joinVoiceChannel} from "@discordjs/voice";
import {
	EmbedBuilder,
	PermissionsBitField,
	type TextChannel,
} from "discord.js";
import {bot} from "../index";
import {MusicQueue} from "../src/MusicQueue";
import {Playlist} from "../src/Playlist";
import {Song} from "../src/Song";
import {i18n} from "../utils/i18n";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		cooldown: 5,
		permissions: [
			PermissionsBitField.Flags.Connect,
			PermissionsBitField.Flags.Speak,
			PermissionsBitField.Flags.ManageMessages,
		],
		description: i18n.__("playlist.description"),
	},
	async function* (argSongName) {
		const guildMemer = this.guild!.members.cache.get(this.user.id);
		const {channel} = guildMemer!.voice;

		const queue = bot.queues.get(this.guild!.id);

		if (!channel) {
			yield {
				content: i18n.__("playlist.errorNotChannel"),
				ephemeral: true,
			};
			return;
		}

		if (queue && channel.id !== queue.connection.joinConfig.channelId) {
			yield {
				content: i18n.__mf("play.errorNotInSameChannel", {
					user: this.client.user!.username,
				}),
			};
		}

		try {
			var playlist = await Playlist.from(
				argSongName!.split(" ")[0],
				argSongName!
			);
		} catch (error) {
			console.error(error);
			yield {
				content: i18n.__("playlist.errorNotFoundPlaylist"),
				ephemeral: true,
			};
			return;
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
					adapterCreator: channel.guild
						.voiceAdapterCreator as DiscordGatewayAdapterCreator,
				}),
			});

			bot.queues.set(this.guild!.id, newQueue);
			newQueue.songs.push(...playlist.videos);

			newQueue.enqueue(playlist.videos[0]);
		}

		let playlistEmbed = new EmbedBuilder()
			.setTitle(`${playlist.data.title}`)
			.setDescription(
				playlist.videos
					.map(
						(song: Song, index: number) =>
							`${index + 1}. ${song.title}`
					)
					.join("\n")
					.slice(0, 4095)
			)
			.setURL(playlist.data.url!)
			.setColor("#F8AA2A")
			.setTimestamp();

		yield {
			content: i18n.__mf("playlist.startedPlaylist", {
				author: this.user.id,
			}),
			embeds: [playlistEmbed],
		};
	},
	{
		name: "playlist",
		description: "Playlist name or link",
		required: true,
		type: "String",
	}
);