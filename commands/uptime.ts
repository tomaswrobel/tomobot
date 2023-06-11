import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "Check the uptime",
	},
	async function* () {
		let seconds = Math.floor(this.client.uptime! / 1000);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		seconds %= 60;
		minutes %= 60;
		hours %= 24;

		yield `Uptime: ${days} d, ${hours} h, ${minutes} min, ${seconds} s`;
	}
);
