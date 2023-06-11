import SlashCommand from "../src/SlashCommand";

export = new SlashCommand({description: "Show the bot's average ping", cooldown: 10}, async function* () {
	yield {
		content: `📈 Average ping to API: ${Math.round(this.client.ws.ping)} ms`,
		ephemeral: true,
	};
});
