import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ComponentType,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
} from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setDescription("Starts a quiz")
		.setName("quiz"),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply("⏳ Loading...").catch(console.error);

		const quiz = await fetch(
			"https://the-trivia-api.com/v2/questions/?limit=1"
		).then(res => res.json());
		const selectBox = new StringSelectMenuBuilder()
			.addOptions(
				[...quiz.incorrectAnswers, quiz.correctAnswer].sort(
					() => Math.random() - 0.5
				)
			)
			.setMaxValues(1)
			.setMinValues(1)
			.setPlaceholder("Select an answer");

		const reply = await interaction.followUp({
			content: "📝 **" + quiz.question + "**",
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					selectBox.setCustomId("quiz")
				),
			],
		});

		const collector = reply.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
		});

		collector.on("collect", async interaction => {
			if (interaction.values[0] === quiz.correctAnswer) {
				await interaction.update({
					content: "✅ **Correct!**",
					components: [],
				});
			} else {
				await interaction.update({
					content: "❌ **Wrong!**",
					components: [],
				});
			}
		});
	},
};
