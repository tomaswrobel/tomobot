import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "Resume currently playing music",
	},
	async function* () {
		const queue = this.client.queues.get(this.guild!.id);
		const guildMemer = this.guild!.members.cache.get(this.user.id);

		if (!queue) {
			yield {
				content: "There is nothing playing.",
				ephemeral: true,
			};
		} else if (!queue.canModify(guildMemer!)) {
			yield "You need to join a voice channel first!";
		} else if (queue.player.unpause()) {
			yield `<@${this.user.id}> ▶ resumed the music!`;
		} else {
			yield "The queue is not paused.";
		}
	}
);
