import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction} from "discord.js";
import youtube, {Video} from "youtube-sr";
import SlashCommand from "../src/SlashCommand";
import play from "./play";

export = new SlashCommand(
	{
		description: "Search and select videos to play",
	},
	async function* (search) {
		const member = this.guild!.members.cache.get(this.user.id);

		if (!member?.voice.channel) {
			yield {
				content: "You need to join a voice channel first!",
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

			yield "An error occurred while searching 🙁";
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

		if (selectInteraction instanceof StringSelectMenuInteraction) {
			selectInteraction.update({
				content: "⏳ Loading the selected songs...",
				components: [],
			});

			await Promise.all(
				selectInteraction.values.map(url => {
					return play.run(this, url);
				})
			);
		}
	},
	{
		type: "String",
		name: "query",
		description: "Search query",
		required: true,
	}
);
