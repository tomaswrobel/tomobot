import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ComponentType,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setDescription("Starts a quiz")
		.setName("quiz"),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply("⏳ Loading...").catch(console.error);

		const [quiz] = await fetch(
			"https://the-trivia-api.com/v2/questions/?limit=1"
		).then(res => res.json());

		const reply = await interaction.followUp({
			content: "📝 **" + quiz.question.text + "**",
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.addOptions(
							[...quiz.incorrectAnswers, quiz.correctAnswer]
								.sort(() => Math.random() - 0.5)
								.map(answer =>
									new StringSelectMenuOptionBuilder()
										.setLabel(answer)
										.setValue(answer)
								)
						)
						.setMaxValues(1)
						.setMinValues(1)
						.setPlaceholder("Select an answer")
				),
			],
		});

		const collector = reply.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
		});

		collector.on("collect", async interaction => {
			await interaction.update({
				components: [],
			});

			if (interaction.values[0] === quiz.correctAnswer) {
				await interaction.followUp("✅ **Correct**");
			} else {
				await interaction.followUp(
					`❌ **Wrong!**. The correct answer was **${quiz.correctAnswer}**`
				);
			}
		});
	},
};
