import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import {config} from "../utils/config";
import {createApi} from "unsplash-js";
import {name} from "../package.json";

const unsplash = createApi({
	accessKey: config.UNSPLASH_ACCESS_KEY,
});

const params = new URLSearchParams({
	utm_source: name,
	utm_medium: "referral",
});

async function getPhoto(query: string | null) {
	if (query) {
		const {response} = await unsplash.search.getPhotos({
			query,
		});

		if (!response) {
			throw new Error("Something went wrong");
		}

		if (response.results.length === 0) {
			throw new Error("No results found");
		}

		return response.results[Math.floor(Math.random() * 10)];
	} else {
		const {response} = await unsplash.photos.getRandom({
			count: 1,
		});

		if (!response) {
			throw new Error("Something went wrong");
		}

		return Array.isArray(response) ? response[0] : response;
	}
}

export default {
	data: new SlashCommandBuilder()
		.setDescription("Searches for a wallpaper")
		.addStringOption(option =>
			option
				.setName("query")
				.setDescription(
					"Search query. If empty, returns a random photo"
				)
				.setRequired(false)
		)
		.setName("wallpaper"),
	async execute(interaction: ChatInputCommandInteraction) {
		const query = interaction.options.getString("query", false);

		if (query) {
			await interaction.reply(`Searching for ${query}...`);
		} else {
			await interaction.reply("Displaying a random photo...");
		}

		try {
			var photo = await getPhoto(query);
		} catch (error: any) {
			return interaction.editReply(String(error));
		}

		const embed = new EmbedBuilder()
			.setDescription(photo.description)
			.setAuthor({
				name: photo.user.name,
				iconURL: photo.user.profile_image.small,
				url: `${photo.user.links.html}?${params}`,
			})
			.setColor(photo.color as `#${string}` | null)
			.setFooter({
				text: "by Unsplash",
			})
			.setImage(photo.urls.regular);

		return interaction.editReply({
			embeds: [embed],
		});
	},
};
