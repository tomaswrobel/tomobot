import {PermissionsBitField, type TextChannel} from "discord.js";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		permissions: [PermissionsBitField.Flags.ManageMessages],
		cooldown: 3,
		description: "Deletes messages",
	},
	async function* (amount) {
		if (amount > 100) {
			yield "You can only delete 100 messages at a time";
		} else if (amount < 1) {
			yield "You must delete at least 1 message";
		} else {
			yield `Deleting ${amount} messages...`;
			const channel = this.channel as TextChannel;
			const messages = await channel.messages.fetch({limit: amount});
			await channel.bulkDelete(messages);
			yield `Deleted ${messages.size} messages`;
		}
	},
	{
		type: "Integer",
		name: "amount",
		description: "Amount of messages to delete",
		required: true,
	}
);
