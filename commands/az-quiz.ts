import AZ from "../src/AZ";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{description: "Starts an AZ quiz", cooldown: 10},
	async function* (user) {
		yield "Starting AZ quiz...";
		if (this.isChatInputCommand()) {
			if (user.bot) {
				yield "You can't challenge a bot!";
			} else {
				await new AZ(this).start();
			}
		} else {
			yield "This command can only be used as a slash command";
		}
	},
	{
		type: "User",
		description: "The opponent to challenge",
		name: "user",
		required: true,
	}
);
