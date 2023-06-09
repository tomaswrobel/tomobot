import move from "array-move";
import {bot} from "../index";
import {i18n} from "../utils/i18n";
import {canModifyQueue} from "../utils/queue";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: i18n.__("move.description"),
	},
	async function* (movefromArg, movetoArg) {
		const guildMemer = this.guild!.members.cache.get(this.user.id);
		const queue = bot.queues.get(this.guild!.id);

		if (!queue) {
			yield i18n.__("move.errorNotQueue");
		} else if (!canModifyQueue(guildMemer!)) {
			yield "Permission denied";
		} else if (!movefromArg || !movetoArg) {
			yield {
				content: i18n.__mf("move.usagesReply", {prefix: bot.prefix}),
				ephemeral: true,
			};
		} else if (isNaN(movefromArg) || movefromArg <= 1) {
			yield {
				content: i18n.__mf("move.usagesReply", {prefix: bot.prefix}),
				ephemeral: true,
			};
		} else {
			let song = queue.songs[movefromArg - 1];

			queue.songs = move(
				queue.songs,
				movefromArg - 1,
				movetoArg == 1 ? 1 : movetoArg - 1
			);

			yield {
				content: i18n.__mf("move.result", {
					author: this.user.id,
					title: song.title,
					index: movetoArg == 1 ? 1 : movetoArg,
				}),
			};
		}
	},
	{
		type: "Integer",
		description: i18n.__("move.args.movefrom"),
		name: "movefrom",
		required: true,
	},
	{
		type: "Integer",
		description: i18n.__("move.args.moveto"),
		name: "moveto",
		required: true,
	}
);