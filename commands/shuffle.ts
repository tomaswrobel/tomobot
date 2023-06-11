import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "Search and select videos to play",
	},
	async function* () {
		const queue = this.client.queues.get(this.guild!.id);
		const guildMemer = this.guild!.members.cache.get(this.user.id);

		if (!queue) {
			yield {
				content: "There is no queue.",
				ephemeral: true,
			};
			return;
		}

		if (!guildMemer || !queue.canModify(guildMemer)) {
			yield "An error occurred while trying to execute this command.";
		} else {
			queue.songs.sort(() => Math.random() - 0.5);
			yield `<@${this.user.id}> 🔀 shuffled the queue`;
		}
	}
);
