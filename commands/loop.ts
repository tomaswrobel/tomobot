import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {bot} from "../index";
import {i18n} from "../utils/i18n";
import {canModifyQueue} from "../utils/queue";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: i18n.__("loop.description"),
	},
	async function* () {
		const queue = bot.queues.get(this.guild!.id);

		const guildMemer = this.guild!.members.cache.get(this.user.id);

		if (!queue) {
			yield {
				content: i18n.__("loop.errorNotQueue"),
				ephemeral: true,
			};
		}

		if (!guildMemer || !canModifyQueue(guildMemer)) {
			yield i18n.__("common.errorNotChannel");
		}

		queue!.loop = !queue!.loop;

		yield {
			content: i18n.__mf("loop.result", {
				loop: queue!.loop ? i18n.__("common.on") : i18n.__("common.off"),
			}),
		};
	}
);
