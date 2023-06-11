import {PermissionsBitField} from "discord.js";
import Database from "../src/Database";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "Add points to a user.",
		permissions: [PermissionsBitField.Flags.Administrator],
	},
	async function* (amount, user) {
		yield SlashCommand.DEFER;

		const database = new Database(this.guild!.id);
		await database.createTable();
		await database.add(user.id, amount);

		yield SlashCommand.DELETE;
	},
	{
		type: "Integer",
		name: "points",
		description: "The amount of points to add.",
		required: true,
	},
	{
		type: "User",
		name: "user",
		description: "The user to add the points to.",
		required: true,
	}
);
