import {bot} from "../index";
import SlashCommand from "../src/SlashCommand";
import {i18n} from "../utils/i18n";
import {canModifyQueue} from "../utils/queue";

export = new SlashCommand(
	{
		description: i18n.__("skip.description"),
	},
	async function* () {
		const queue = bot.queues.get(this.guild!.id);
		const guildMemer = this.guild!.members.cache.get(this.user.id);

		if (!queue) {
			yield {
				content: i18n.__("skip.errorNotQueue"),
				ephemeral: true,
			};
			return;
		}

		if (!canModifyQueue(guildMemer!)) {
			yield i18n.__("common.errorNotChannel");
			return;
		}

		queue.player.stop(true);

		yield i18n.__mf("skip.result", {
			author: this.user.id,
		});
	}
);
