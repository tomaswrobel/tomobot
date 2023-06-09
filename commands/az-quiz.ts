import AZ from "../src/AZ";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{description: "Starts an AZ quiz", cooldown: 10},
	async function* () {
		yield "Starting AZ quiz...";
		if (this.isChatInputCommand()) {
			await new AZ(this).start();
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
)
