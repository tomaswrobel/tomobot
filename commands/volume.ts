import {bot} from "../index";
import {i18n} from "../utils/i18n";
import {canModifyQueue} from "../utils/queue";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: i18n.__("volume.description"),
	},
	async function* (volumeArg) {
		const queue = bot.queues.get(this.guild!.id);
		const guildMemer = this.guild!.members.cache.get(this.user.id);

		if (!queue) {
			yield {
				content: i18n.__("volume.errorNotQueue"),
				ephemeral: true,
			};
			return;
		}

		if (!canModifyQueue(guildMemer!)) {
			yield {
				content: i18n.__("volume.errorNotChannel"),
				ephemeral: true,
			};
			return;
		}

		if (!volumeArg || volumeArg === queue.volume) {
			yield i18n.__mf("volume.currentVolume", {
				volume: queue.volume,
			});
			return;
		}

		if (isNaN(volumeArg)) {
			yield {
				content: i18n.__("volume.errorNotNumber"),
				ephemeral: true,
			};
			return;
		}

		if (volumeArg > 100 || volumeArg < 0) {
			yield {
				content: i18n.__("volume.errorNotValid"),
				ephemeral: true,
			};
			return;
		}

		queue.volume = volumeArg;
		queue.resource.volume?.setVolumeLogarithmic(volumeArg / 100);

		yield i18n.__mf("volume.result", {arg: volumeArg});
	},
	{
		type: "Integer",
		name: "volume",
		description: i18n.__("volume.args.volume"),
	}
);
