import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	PermissionsBitField,
} from "discord.js";
import {bot} from "../index";
import {Song} from "../src/Song";
import {i18n} from "../utils/i18n";
import SlashCommand from "../src/SlashCommand";

function generateQueueEmbed(interaction: CommandInteraction | ButtonInteraction, songs: Song[]) {
	let embeds = [];
	let k = 10;

	for (let i = 0; i < songs.length; i += 10) {
		const current = songs.slice(i, k);
		let j = i;
		k += 10;

		const info = current.map(track => `${++j} - [${track.title}](${track.url})`).join("\n");

		const embed = new EmbedBuilder()
			.setTitle(i18n.__("queue.embedTitle"))
			.setThumbnail(interaction.guild?.iconURL()!)
			.setColor("#F8AA2A")
			.setDescription(
				i18n.__mf("queue.embedCurrentSong", {
					title: songs[0].title,
					url: songs[0].url,
					info: info,
				})
			)
			.setTimestamp();
		embeds.push(embed);
	}

	return embeds;
}

export = new SlashCommand(
	{
		cooldown: 5,
		permissions: [PermissionsBitField.Flags.ManageMessages],
		description: i18n.__("queue.description"),
	},
	async function* () {
		const queue = bot.queues.get(this.guild!.id);
		if (!queue || !queue.songs.length) {
			yield i18n.__("queue.errorNotQueue");
			return;
		}

		let currentPage = 0;
		const embeds = generateQueueEmbed(this, queue.songs);

		yield "⏳ Loading queue...";

		if (this.replied) {
			yield {
				content: `**${i18n.__mf("queue.currentPage")} ${currentPage + 1}/${embeds.length}**`,
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
			await interaction.deferReply();
			await interaction.deleteReply();
			try {
				if (interaction.id === "next") {
					if (currentPage < embeds.length - 1) {
						currentPage++;
						queueEmbed.edit({
							content: i18n.__mf("queue.currentPage", {
								page: currentPage + 1,
								length: embeds.length,
							}),
							embeds: [embeds[currentPage]],
						});
					}
				} else if (interaction.id === "previous") {
					if (currentPage !== 0) {
						--currentPage;
						queueEmbed.edit({
							content: i18n.__mf("queue.currentPage", {
								page: currentPage + 1,
								length: embeds.length,
							}),
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
