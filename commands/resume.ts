import {bot} from "../index";
import {i18n} from "../utils/i18n";
import {canModifyQueue} from "../utils/queue";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: i18n.__("resume.description"),
	},
	async function* () {
		const queue = bot.queues.get(this.guild!.id);
		const guildMemer = this.guild!.members.cache.get(this.user.id);

		if (!queue) {
			yield {
				content: i18n.__("resume.errorNotQueue"),
				ephemeral: true,
			};
			return;
		}

		if (!canModifyQueue(guildMemer!)) {
			yield i18n.__("common.errorNotChannel");
			return;
		}

		if (queue.player.unpause()) {
			yield {
				content: i18n.__mf("resume.resultNotPlaying", {
					author: this.user.id,
				}),
			};
		}

		yield i18n.__("resume.errorPlaying");
	}
);