import {
	AudioPlayer,
	AudioPlayerState,
	AudioPlayerStatus,
	AudioResource,
	createAudioPlayer,
	entersState,
	NoSubscriberBehavior,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionState,
	VoiceConnectionStatus,
} from "@discordjs/voice";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, ComponentType, Message, TextChannel, User } from "discord.js";
import { promisify } from "node:util";
import { bot } from "../index";
import { QueueOptions } from "../interfaces/QueueOptions";
import { config } from "../utils/config";
import { i18n } from "../utils/i18n";
import { canModifyQueue } from "../utils/queue";
import { Song } from "./Song";

const wait = promisify(setTimeout);

export class MusicQueue {
	public readonly interaction: CommandInteraction;
	public readonly connection: VoiceConnection;
	public readonly player: AudioPlayer;
	public readonly textChannel: TextChannel;
	public readonly bot = bot;

	public resource: AudioResource;
	public songs: Song[] = [];
	public volume = config.DEFAULT_VOLUME || 100;
	public loop = false;
	public muted = false;
	public waitTimeout: NodeJS.Timeout | null;
	private queueLock = false;
	private readyLock = false;
	private stopped = false;

	public constructor(options: QueueOptions) {
		Object.assign(this, options);

		this.player = createAudioPlayer({
			behaviors: { noSubscriber: NoSubscriberBehavior.Play },
		});
		this.connection.subscribe(this.player);

		const networkStateChangeHandler = (
			oldNetworkState: any,
			newNetworkState: any
		) => {
			const newUdp = Reflect.get(newNetworkState, "udp");
			clearInterval(newUdp?.keepAliveInterval);
		};

		this.connection.on(
			"stateChange" as any,
			async (
				oldState: VoiceConnectionState,
				newState: VoiceConnectionState
			) => {
				Reflect.get(oldState, "networking")?.off(
					"stateChange",
					networkStateChangeHandler
				);
				Reflect.get(newState, "networking")?.on(
					"stateChange",
					networkStateChangeHandler
				);

				if (newState.status === VoiceConnectionStatus.Disconnected) {
					if (
						newState.reason ===
						VoiceConnectionDisconnectReason.WebSocketClose &&
						newState.closeCode === 4014
					) {
						try {
							this.stop();
						} catch (e) {
							console.log(e);
							this.stop();
						}
					} else if (this.connection.rejoinAttempts < 5) {
						await wait(
							(this.connection.rejoinAttempts + 1) * 5_000
						);
						this.connection.rejoin();
					} else {
						this.connection.destroy();
					}
				} else if (
					!this.readyLock &&
					(newState.status === VoiceConnectionStatus.Connecting ||
						newState.status === VoiceConnectionStatus.Signalling)
				) {
					this.readyLock = true;
					try {
						await entersState(
							this.connection,
							VoiceConnectionStatus.Ready,
							20_000
						);
					} catch {
						if (
							this.connection.state.status !==
							VoiceConnectionStatus.Destroyed
						) {
							try {
								this.connection.destroy();
							} catch { }
						}
					} finally {
						this.readyLock = false;
					}
				}
			}
		);

		this.player.on(
			"stateChange" as any,
			async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
				if (
					oldState.status !== AudioPlayerStatus.Idle &&
					newState.status === AudioPlayerStatus.Idle
				) {
					if (this.loop && this.songs.length) {
						this.songs.push(this.songs.shift()!);
					} else {
						this.songs.shift();
						if (!this.songs.length) return this.stop();
					}

					if (this.songs.length || this.resource.audioPlayer)
						this.processQueue();
				} else if (
					oldState.status === AudioPlayerStatus.Buffering &&
					newState.status === AudioPlayerStatus.Playing
				) {
					this.sendPlayingMessage(newState);
				}
			}
		);

		this.player.on("error", error => {
			console.error(error);

			if (this.loop && this.songs.length) {
				this.songs.push(this.songs.shift()!);
			} else {
				this.songs.shift();
			}

			this.processQueue();
		});
	}

	public enqueue(...songs: Song[]) {
		if (this.waitTimeout !== null) clearTimeout(this.waitTimeout);
		this.waitTimeout = null;
		this.stopped = false;
		this.songs = this.songs.concat(songs);
		this.processQueue();
	}

	public stop() {
		if (this.stopped) return;

		this.stopped = true;
		this.loop = false;
		this.songs = [];
		this.player.stop();

		!config.PRUNING &&
			this.textChannel
				.send(i18n.__("play.queueEnded"))
				.catch(console.error);

		if (this.waitTimeout !== null) return;

		this.waitTimeout = setTimeout(() => {
			if (
				this.connection.state.status !== VoiceConnectionStatus.Destroyed
			) {
				try {
					this.connection.destroy();
				} catch { }
			}
			bot.queues.delete(this.interaction.guild!.id);

			!config.PRUNING &&
				this.textChannel.send(i18n.__("play.leaveChannel"));
		}, config.STAY_TIME * 1000);
	}

	public async processQueue(): Promise<void> {
		if (
			this.queueLock ||
			this.player.state.status !== AudioPlayerStatus.Idle
		) {
			return;
		}

		if (!this.songs.length) {
			return this.stop();
		}

		this.queueLock = true;

		const next = this.songs[0];

		try {
			const resource = await next.makeResource();

			this.resource = resource!;
			this.player.play(this.resource);
			this.resource.volume?.setVolumeLogarithmic(this.volume / 100);
		} catch (error) {
			console.error(error);

			return this.processQueue();
		} finally {
			this.queueLock = false;
		}
	}

	private async sendPlayingMessage(newState: any) {
		const song = (newState.resource as AudioResource<Song>).metadata;

		let playingMessage: Message;

		try {
			const row = new ActionRowBuilder<ButtonBuilder>()
				.addComponents(
					new ButtonBuilder()
						.setEmoji("⏭")
						.setLabel("Skip")
						.setStyle(ButtonStyle.Primary)
						.setCustomId("skip"),
					new ButtonBuilder()
						.setEmoji("⏯")
						.setLabel("Pause")
						.setStyle(ButtonStyle.Primary)
						.setCustomId("pause"),
					new ButtonBuilder()
						.setEmoji("🔇")
						.setLabel("Mute")
						.setStyle(ButtonStyle.Primary)
						.setCustomId("mute"),
					new ButtonBuilder()
						.setEmoji("🔉")
						.setLabel("Volume Down")
						.setStyle(ButtonStyle.Primary)
						.setCustomId("volumeDown"),
				);
			const row2 = new ActionRowBuilder<ButtonBuilder>()
				.addComponents(
					new ButtonBuilder()
						.setEmoji("🔊")
						.setLabel("Volume Up")
						.setStyle(ButtonStyle.Primary)
						.setCustomId("volumeUp"),
					new ButtonBuilder()
						.setEmoji("🔁")
						.setLabel("Loop")
						.setStyle(ButtonStyle.Primary)
						.setCustomId("loop"),
					new ButtonBuilder()
						.setEmoji("🔀")
						.setLabel("Shuffle")
						.setStyle(ButtonStyle.Primary)
						.setCustomId("shuffle"),
					new ButtonBuilder()
						.setEmoji("⏹")
						.setLabel("Stop")
						.setStyle(ButtonStyle.Primary)
						.setCustomId("stop"),
				);

			playingMessage = await this.textChannel.send({
				content: (newState.resource as AudioResource<Song>).metadata.startMessage(),
				components: [row, row2],
			});
		} catch (error: any) {
			console.error(error);
			this.textChannel.send(error.message);
			return;
		}

		const collector = playingMessage.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: song.duration > 0 ? song.duration * 1000 : 600000,
		});

		collector.on("collect", async (interaction) => {
			switch (interaction.customId) {
				case "skip":
					await this.bot.slashCommandsMap
						.get("skip")!
						.execute(interaction);
					break;
				case "pause":
					if (this.player.state.status == AudioPlayerStatus.Playing) {
						await this.bot.slashCommandsMap
							.get("pause")!
							.execute(interaction);
					} else {
						await this.bot.slashCommandsMap
							.get("resume")!
							.execute(interaction);
					}
					break;
				case "mute":
					if (this.muted = !this.muted) {
						this.resource.volume?.setVolumeLogarithmic(0);
						if (interaction.replied) {
							await interaction.editReply(
								i18n.__mf("play.mutedSong", { author: interaction.user })
							).catch(console.error);
						} else {
							await interaction.reply(
								i18n.__mf("play.mutedSong", { author: interaction.user })
							).catch(console.error);
						}
					} else {
						this.resource.volume?.setVolumeLogarithmic(
							this.volume / 100
						);
						const msg = i18n.__mf("play.unmutedSong", { author: interaction.user });
						if (interaction.replied) {
							await interaction.editReply(msg).catch(console.error);
						} else {
							await interaction.reply(msg).catch(console.error);
						}
					}
					break;
				case "volumeDown": {
					this.volume = Math.max(this.volume - 10, 0);
					this.resource.volume?.setVolumeLogarithmic(
						this.volume / 100
					);
					const msg = i18n.__mf("play.decreasedVolume", {
						author: interaction.user,
						volume: this.volume,
					});
					if (interaction.replied) {
						await interaction.editReply(msg).catch(console.error);
					} else {
						await interaction.reply(msg).catch(console.error);
					}
					break;
				}
				case "volumeUp":
					this.volume = Math.min(this.volume + 10, 100);
					this.resource.volume?.setVolumeLogarithmic(
						this.volume / 100
					);
					const msg = i18n.__mf("play.increasedVolume", {
						author: interaction.user,
						volume: this.volume,
					});
					if (interaction.replied) {
						await interaction.editReply(msg).catch(console.error);
					} else {
						await interaction.reply(msg).catch(console.error);
					}
					break;
				case "loop":
					await this.bot.slashCommandsMap
						.get("loop")!
						.execute(interaction);
					break;
				case "shuffle":
					await this.bot.slashCommandsMap
						.get("shuffle")!
						.execute(interaction);
					break;

				case "stop":
					await this.bot.slashCommandsMap
						.get("stop")!
						.execute(interaction);
					collector.stop();
					break;
			}
		});

		collector.on("end", () => {
			if (config.PRUNING) {
				setTimeout(() => {
					playingMessage.delete().catch();
				}, 3000);
			}
		});
	}
}
