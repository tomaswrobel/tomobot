import {DiscordGatewayAdapterCreator, joinVoiceChannel} from "@discordjs/voice";
import {
	ChatInputCommandInteraction,
	PermissionsBitField,
	SlashCommandBuilder,
	TextChannel,
} from "discord.js";
import {bot} from "../index";
import {MusicQueue} from "../src/MusicQueue";
import {Song} from "../src/Song";
import {i18n} from "../utils/i18n";
import {playlistPattern} from "../utils/patterns";
import SlashCommand from "../src/SlashCommand";
import playlist from "./playlist";

export = new SlashCommand(
	{
		description: i18n.__("play.description"),
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
				content: i18n.__("play.errorNotChannel"),
				ephemeral: true,
			};
			return;
		}

		const queue = bot.queues.get(this.guild!.id);

		if (queue && channel.id !== queue.connection.joinConfig.channelId) {
			yield {
				content: i18n.__mf("play.errorNotInSameChannel", {
					user: bot.client.user!.username,
				}),
				ephemeral: true,
			};
			return;
		}

		if (!url) {
			yield {
				content: i18n.__mf("play.usagesReply", {prefix: bot.prefix}),
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
					content: i18n.__mf("play.errorNoResults", {
						url: `<${url}>`,
					}),
					ephemeral: true,
				};
				return;
			}
			if (error.name == "InvalidURL") {
				yield {
					content: i18n.__mf("play.errorInvalidURL", {
						url: `<${url}>`,
					}),
					ephemeral: true,
				};
				return;
			}

			console.error(error);
			yield {
				content: i18n.__("common.errorCommand"),
				ephemeral: true,
			};
			return;
		}

		if (queue) {
			queue.enqueue(song);

			return this.channel!
				.send({
					content: i18n.__mf("play.queueAdded", {
						title: song.title,
						author: this.user.id,
					}),
				})
				.catch(console.error);
		}

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
		newQueue.enqueue(song);

		yield SlashCommand.DELETE;
	},
	{
		type: "String",
		description: i18n.__("play.args.song"),
		name: "song",
		required: true,
	}
);