import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "Pause the currently playing music",
	},
	async function* () {
		const guildMemer = this.guild!.members.cache.get(this.user.id);
		const queue = this.client.queues.get(this.guild!.id);

		if (!queue) {
			yield "There is nothing playing.";
		} else if (!queue.canModify(guildMemer!)) {
			yield "You need to join a voice channel first!";
		} else if (queue.player.pause()) {
			yield `<@${this.user.id}> ⏸ paused the music`;
		}
	}
);
