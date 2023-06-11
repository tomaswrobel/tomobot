import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	PermissionsBitField,
	StringSelectMenuInteraction
} from "discord.js";
import {Song} from "../src/Song";
import SlashCommand from "../src/SlashCommand";

function generateQueueEmbed(interaction: CommandInteraction | ButtonInteraction | StringSelectMenuInteraction, songs: Song[]) {
	const embeds = [];

	for (let i = 0, k = 10; i < songs.length; i += 10, k += 10) {
		const current = songs.slice(i, k);

		const info = current.reduce(
			(rest, track) => `${rest}\n${i + 1} - [${track.title}](${track.url})`,
			"\n"
		);

		const embed = new EmbedBuilder()
			.setTitle("Song Queue")
			.setThumbnail(interaction.guild!.iconURL())
			.setColor("#F8AA2A")
			.setDescription(`**Current Song - [${songs[0].title}](${songs[0].url})**${info}`)
			.setTimestamp();
		embeds.push(embed);
	}

	return embeds;
}

export = new SlashCommand(
	{
		cooldown: 5,
		permissions: [PermissionsBitField.Flags.ManageMessages],
		description: "Show the music queue and now playing.",
	},
	async function* () {
		const queue = this.client.queues.get(this.guild!.id);
		if (!queue || !queue.songs.length) {
			return yield "❌ **Nothing playing in this server**";
		}

		let currentPage = 0;
		const embeds = generateQueueEmbed(this, queue.songs);

		yield "⏳ Loading queue...";

		if (this.replied) {
			yield {
				content: `**Current Page - ${currentPage + 1}/${embeds.length}**`,
				embeds: [embeds[currentPage]],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId("previous")
							.setLabel("Previous")
							.setEmoji("⬅️")
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId("stop")
							.setLabel("Stop")
							.setEmoji("⏹")
							.setStyle(ButtonStyle.Danger),
						new ButtonBuilder()
							.setCustomId("next")
							.setLabel("Next")
							.setEmoji("➡️")
							.setStyle(ButtonStyle.Primary)
					),
				],
			};
		}

		const queueEmbed = await this.fetchReply();

		const collector = queueEmbed.createMessageComponentCollector({
			time: 60000,
		});

		collector.on("collect", async interaction => {
			await interaction.deferReply().catch(console.error);
			await interaction.deleteReply().catch(console.error);
			try {
				if (interaction.id === "next") {
					if (currentPage < embeds.length - 1) {
						currentPage++;
						queueEmbed.edit({
							content: `**Current Page - ${currentPage + 1}/${embeds.length}**`,
							embeds: [embeds[currentPage]],
						});
					}
				} else if (interaction.id === "previous") {
					if (currentPage !== 0) {
						--currentPage;
						queueEmbed.edit({
							content: `**Current Page - ${currentPage + 1}/${embeds.length}**`,
							embeds: [embeds[currentPage]],
						});
					}
				} else {
					collector.stop();
				}
			} catch (error: any) {
				console.error(error);
			}
		});
	}
);
