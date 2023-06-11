import move from "array-move";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "Move songs around in the queue",
	},
	async function* (movefromArg, movetoArg) {
		const guildMemer = this.guild!.members.cache.get(this.user.id);
		const queue = this.client.queues.get(this.guild!.id);

		if (!queue) {
			yield "There is no queue.";
		} else if (!queue.canModify(guildMemer!)) {
			yield "Permission denied";
		} else if (!movefromArg || !movetoArg) {
			yield {
				content: `Usage: \`/move <from> <to>\``,
				ephemeral: true,
			};
		} else if (isNaN(movefromArg) || movefromArg <= 1) {
			yield {
				content: `Usage: \`/move <from> <to>\``,
				ephemeral: true,
			};
		} else {
			const song = queue.songs[movefromArg - 1];

			queue.songs = move(queue.songs, movefromArg - 1, movetoArg == 1 ? 1 : movetoArg - 1);

			yield `<@${this.user.id}> 🚚 moved **${song.title}** to position **${movetoArg}** in the queue`;
		}
	},
	{
		type: "Integer",
		description: "Slot to move from",
		name: "movefrom",
		required: true,
	},
	{
		type: "Integer",
		description: "Slot to move to",
		name: "moveto",
		required: true,
	}
);
