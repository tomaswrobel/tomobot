import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {i18n} from "../utils/i18n";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{description: i18n.__("ping.description"), cooldown: 10},
	async function* () {
		yield {
			content: i18n.__mf("ping.result", {
				ping: Math.round(this.client.ws.ping),
			}),
			ephemeral: true,
		};
	},
);
