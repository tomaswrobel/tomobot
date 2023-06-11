import {DiscordGatewayAdapterCreator, joinVoiceChannel} from "@discordjs/voice";
import {PermissionsBitField, TextChannel} from "discord.js";
import MusicQueue from "../src/MusicQueue";
import {Song} from "../src/Song";
import SlashCommand from "../src/SlashCommand";
import playlist from "./playlist";

const playlistPattern = /^.*(list=)([^#\&\?]*).*/;

export = new SlashCommand(
	{
		description: "Plays audio from YouTube",
		permissions: [
			PermissionsBitField.Flags.Connect,
			PermissionsBitField.Flags.Speak,
			PermissionsBitField.Flags.ManageMessages,
		],
		cooldown: 3,
	},
	async function* (url) {
		const guildMember = this.guild!.members.cache.get(this.user.id);
		const {channel} = guildMember!.voice;

		if (!channel) {
			yield {
				content: "You need to join a voice channel first!",
				ephemeral: true,
			};
			return;
		}

		const queue = this.client.queues.get(this.guild!.id);

		if (queue && channel.id !== queue.connection.joinConfig.channelId) {
			yield {
				content: `You must be in the same channel as ${this.client.user.username}`,
				ephemeral: true,
			};
			return;
		}

		if (!url) {
			yield {
				content: `"Usage: /play <YouTube URL | Video Name>"`,
				ephemeral: true,
			};
			return;
		}

		yield "⏳ Loading...";

		// Start the playlist if playlist url was provided
		if (playlistPattern.test(url)) {
			yield "🔗 Link is playlist";
			await playlist.run(this, url);
			return;
		}

		try {
			var song = await Song.from(url, url);
		} catch (error: any) {
			if (error.name == "NoResults") {
				yield {
					content: `No results found for <${url}>`,
					ephemeral: true,
				};
				return;
			}
			if (error.name == "InvalidURL") {
				yield {
					content: "Invalid URL, please try a search or a YouTube URL",
					ephemeral: true,
				};
				return;
			}

			console.error(error);
			yield {
				content: "There was an error executing that command.",
				ephemeral: true,
			};
			return;
		}

		if (queue) {
			queue.enqueue(song);

			return this.channel!.send({
				content: `"✅ **${song.title}** has been added to the queue by <@${this.user.id}>`,
			}).catch(console.error);
		}

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
		newQueue.enqueue(song);

		yield SlashCommand.DELETE;
	},
	{
		type: "String",
		description: "The song to play. Can be a YouTube URL or a search query.",
		name: "song",
		required: true,
	}
);
