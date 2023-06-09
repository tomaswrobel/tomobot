import {bot} from "../index";
import SlashCommand from "../src/SlashCommand";
import {i18n} from "../utils/i18n";
import {canModifyQueue} from "../utils/queue";

export = new SlashCommand(
	{
		description: i18n.__("stop.description"),
	},
	async function* () {
		const queue = bot.queues.get(this.guild!.id);
		const guildMemer = this.guild!.members.cache.get(this.user.id);

		if (!queue) {
			yield {
				content: i18n.__("stop.errorNotQueue"),
				ephemeral: true,
			};
			return;
		}

		if (!guildMemer || !canModifyQueue(guildMemer)) {
			yield i18n.__("common.errorNotChannel");
			return;
		}

		queue.stop();

		yield i18n.__mf("stop.result", {
			author: this.user.id,
		});
	}
);