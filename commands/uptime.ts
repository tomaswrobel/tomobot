import {bot} from "../index";
import SlashCommand from "../src/SlashCommand";
import {i18n} from "../utils/i18n";

export = new SlashCommand(
	{
		description: i18n.__("uptime.description"),
	},
	async function* () {
		let seconds = Math.floor(bot.client.uptime! / 1000);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);
		let days = Math.floor(hours / 24);

		seconds %= 60;
		minutes %= 60;
		hours %= 24;

		yield i18n.__mf("uptime.result", {
			days: days,
			hours: hours,
			minutes: minutes,
			seconds: seconds,
		});
	}
);
