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

export default {
	data: new SlashCommandBuilder()
        .setDescription("Searches for a wallpaper")
		.addStringOption(option =>
			option
				.setName("query")
				.setDescription("Search query")
				.setRequired(true)
		)
		.setName("wallpaper"),
	async execute(interaction: ChatInputCommandInteraction) {
		const query = interaction.options.getString("query", true);
        await interaction.reply(`Searching for ${query}...`);
        const photos = await unsplash.search.getPhotos({
            query,
            page: 1,
        });

        if (photos.errors) {
            return interaction.editReply({
                content: "Something went wrong"
            });
        }

        if (photos.response?.results.length === 0) {
            return interaction.editReply({
                content: "No results found",
            });
        }

        const photo = photos.response!.results[Math.floor(Math.random() * 10)];

        const embed = new EmbedBuilder()
            .setTitle(photo.alt_description || photo.description || "Untitled")
            .setAuthor({
                name: photo.user.name,
                iconURL: photo.user.profile_image.small,
                url: photo.user.links.html
            })
            .setImage(photo.urls.regular)
            .setFooter({
                text: "Powered by Unsplash",
                iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_Unsplash.svg/240px-Logo_of_Unsplash.svg.png"
            });
        
        return interaction.editReply({
            embeds: [embed]
        });
	},
};
