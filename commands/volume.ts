import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "Change volume of currently playing music",
	},
	async function* (volumeArg) {
		const queue = this.client.queues.get(this.guild!.id);
		const guildMemer = this.guild!.members.cache.get(this.user.id);

		if (!queue) {
			yield {
				content: "There is nothing playing.",
				ephemeral: true,
			};
			return;
		}

		if (!queue.canModify(guildMemer!)) {
			yield {
				content: "You need to join a voice channel first!",
				ephemeral: true,
			};
			return;
		}

		if (!volumeArg || volumeArg === queue.volume) {
			yield `🔊 The current volume is: **${queue.volume}%**`;
		} else if (volumeArg > 100 || volumeArg < 0) {
			yield {
				content: "Please use a number between 0 - 100.",
				ephemeral: true,
			};
		} else {
			queue.volume = volumeArg;
			queue.resource.volume?.setVolumeLogarithmic(volumeArg / 100);
			yield `🔊 Volume set to: **${volumeArg}%**`;
		}
	},
	{
		type: "Integer",
		name: "volume",
		description: "The volume to set. If not provided, the current volume is shown.",
	}
);
