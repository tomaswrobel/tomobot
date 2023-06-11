import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "Skip the currently playing song",
	},
	async function* () {
		const queue = this.client.queues.get(this.guild!.id);
		const guildMemer = this.guild!.members.cache.get(this.user.id);

		if (!queue) {
			yield {
				content: "There is nothing playing that I could skip for you.",
				ephemeral: true,
			};
			return;
		}

		if (!queue.canModify(guildMemer!)) {
			yield "You need to join a voice channel first!";
		} else {
			queue.player.stop(true);
			yield `@${this.user.id}> ⏭ skipped the song`;
		}
	}
);
