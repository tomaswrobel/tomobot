import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "Toggle music loop",
	},
	async function* () {
		const queue = this.client.queues.get(this.guild!.id);

		const guildMemer = this.guild!.members.cache.get(this.user.id);

		if (!queue) {
			yield {
				content: "There is nothing playing.",
				ephemeral: true,
			};
			return;
		}

		if (!guildMemer || !queue.canModify(guildMemer)) {
			yield "You need to join a voice channel first!";
		} else {
			yield `Loop is now **${(queue.loop = !queue.loop) ? "on" : "off"}**`;
		}
	}
);
