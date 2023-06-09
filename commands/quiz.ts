import {
	ActionRowBuilder,
	ComponentType,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "Starts a quiz",
	},
	async function* () {
		yield "⏳ Loading...";

		const [quiz] = await fetch("https://the-trivia-api.com/v2/questions/?limit=1").then(res => res.json());

		yield {
			content: "📝 **" + quiz.question.text + "**",
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.addOptions(
							[...quiz.incorrectAnswers, quiz.correctAnswer]
								.sort(() => Math.random() - 0.5)
								.map(answer =>
									new StringSelectMenuOptionBuilder().setLabel(answer).setValue(answer)
								)
						)
						.setCustomId("quiz")
						.setMaxValues(1)
						.setMinValues(1)
						.setPlaceholder("Select an answer")
				),
			],
		};

		const reply = await this.fetchReply();

		const collector = reply.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			filter: i => i.user.id === this.user.id,
		});

		collector.once("collect", async interaction => {
			await reply.edit({
				components: [],
			});

			if (interaction.values[0] === quiz.correctAnswer) {
				await interaction.reply("✅ **Correct**");
			} else {
				await interaction.reply(`❌ **Wrong!**. The correct answer was **${quiz.correctAnswer}**`);
			}
		});
	}
);
