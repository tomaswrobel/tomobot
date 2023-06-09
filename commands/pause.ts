import {bot} from "../index";
import SlashCommand from "../src/SlashCommand";
import {i18n} from "../utils/i18n";
import {canModifyQueue} from "../utils/queue";

export = new SlashCommand(
	{
		description: i18n.__("pause.description"),
	},
	async function* () {
		const guildMemer = this.guild!.members.cache.get(this.user.id);
		const queue = bot.queues.get(this.guild!.id);

		if (!queue) {
			yield i18n.__("pause.errorNotQueue");
			return;
		}

		if (!canModifyQueue(guildMemer!)) {
			yield i18n.__("common.errorNotChannel");
			return;
		}

		if (queue.player.pause()) {
			yield i18n.__mf("pause.result", {
				author: this.user.id,
			});
		}
	}
);