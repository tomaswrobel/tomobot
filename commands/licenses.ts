import {EmbedBuilder} from "discord.js";
import {dependencies, repository} from "../package.json";
import SlashCommand from "../src/SlashCommand";
import {join} from "path";

const api = `https://api.github.com/repos${new URL(repository.url).pathname}`;

export = new SlashCommand({description: "See open-source licenses"}, async function* () {
	yield "Loading...";

	const embed = new EmbedBuilder();

	for (const name in dependencies) {
		const {description} = require(join(__dirname, "..", "node_modules", name, "package.json"));

		embed.addFields({
			name,
			value: `${description}\n[View on npm](https://npmjs.com/package/${name})`,
		});
	}


	const {owner, description} = await fetch(api).then(res => res.json());

	yield {
		content: `**${this.client.user.username} would not be possible without the following open source projects:**\n\n`,
		embeds: [
			embed.addFields({
				name: "evobot",
				value: "The core of the music functions. \n[View on GitHub](https://github.com/eritislami/evobot)",
			}),
			new EmbedBuilder()
				.setTitle(`${this.client.user.username}'s source code`)
				.setAuthor({
					name: owner.login,
					iconURL: owner.avatar_url,
					url: repository.url
				})
				.setDescription(description),
		],
	};
});
