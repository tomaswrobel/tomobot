import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import {config} from "../utils/config";
import {createApi} from "unsplash-js";

const unsplash = createApi({
	accessKey: config.UNSPLASH_ACCESS_KEY,
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
				.setDescription("Search query. If empty, returns a random photo")
				.setRequired(false)
		)
		.setName("wallpaper"),
	async execute(interaction: ChatInputCommandInteraction) {
		const query = interaction.options.getString("query", false);
		await interaction.reply(`Searching for ${query}...`);

		try {
			var photo = await getPhoto(query);
		} catch (error: any) {
			return interaction.editReply(String(error));
		}

		const embed = new EmbedBuilder()
			.setTitle(photo.alt_description || photo.description)
			.setAuthor({
				name: photo.user.name,
				iconURL: photo.user.profile_image.small,
				url:
					photo.user.links.html +
					"?utm_source=tomobot&utm_medium=referral",
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
