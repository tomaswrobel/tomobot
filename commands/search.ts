import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
} from "discord.js";
import youtube, {Video} from "youtube-sr";
import {i18n} from "../utils/i18n";
import SlashCommand from "../src/SlashCommand";
import play from "./play";

export = new SlashCommand(
	{
		description: i18n.__("search.description"),
	},
	async function* (search) {
		const member = this.guild!.members.cache.get(this.user.id);

		if (!member?.voice.channel) {
			yield {
				content: i18n.__("search.errorNotChannel"),
				ephemeral: true,
			};
			return;
		}

		yield "⏳ Searching...";

		const results: Video[] = [];

		try {
			results.push(...(await youtube.search(search, {limit: 10, type: "video"})));
		} catch (error: any) {
			console.error(error);

			yield i18n.__("common.errorCommand");
		}

		if (!results.length) {
			return;
		}

		const options = results!.map(video => {
			return {
				label: video.title ?? "",
				value: video.url,
			};
		});

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId("search-select")
				.setPlaceholder("Nothing selected")
				.setMinValues(1)
				.setMaxValues(10)
				.addOptions(options)
		);

		const followUp = await this.followUp({
			content: "Choose songs to play",
			components: [row],
		});

		const selectInteraction = await followUp.awaitMessageComponent({
			time: 30000,
		});

		if (!(selectInteraction instanceof StringSelectMenuInteraction)) return;

		selectInteraction.update({
			content: "⏳ Loading the selected songs...",
			components: [],
		});

		await Promise.all(
			selectInteraction.values.map(url => {
				return play.run(this, url);
			})
		);
	},
	{
		type: "String",
		name: "query",
		description: i18n.__("search.optionQuery"),
		required: true,
	}
);