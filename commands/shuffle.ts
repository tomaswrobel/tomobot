import {bot} from "../index";
import {i18n} from "../utils/i18n";
import {canModifyQueue} from "../utils/queue";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: i18n.__("shuffle.description"),
	},
	async function* () {
		const queue = bot.queues.get(this.guild!.id);
		const guildMemer = this.guild!.members.cache.get(
			this.user.id
		);

		if (!queue){
			yield{
					content: i18n.__("shuffle.errorNotQueue"),
					ephemeral: true,
				}
			return;
		}

		if (!guildMemer || !canModifyQueue(guildMemer)) {
			yield i18n.__("common.errorNotChannel");
			return;
		}

		queue.songs.sort(() => Math.random() - 0.5);

		yield i18n.__mf("shuffle.result", {author: this.user.id});
	}
);