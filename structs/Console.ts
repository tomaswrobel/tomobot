import {type Message, EmbedBuilder} from "discord.js";
import * as Babel from "@babel/core";

const AsyncFunction = async function () {}.constructor as new (
	...args: string[]
) => (...args: any[]) => Promise<any>;

class Console {
	message!: Message;
	builder!: EmbedBuilder;
	data: Console.Data[] = [];

	async update() {
		if (this.message && this.builder) {
			await this.message.edit({
				embeds: [this.builder],
			});
		}
	}

	log(...args: any[]) {
		for (const arg of args) {
			this.builder.addFields({
				name: "Console",
				value: stringify(arg),
			});
		}
		this.update();
	}

	error(...args: any[]) {
		for (const arg of args) {
			this.builder.addFields({
				value: stringify(arg),
				name: "Error",
			});
		}
		this.update();
	}

	clear() {
		this.data.length = 0;
		this.update();
	}

	warn(...args: any[]) {
		for (const arg of args) {
			this.builder.addFields({
				value: stringify(arg),
				name: ":warning: Warn",
			});
		}
		this.update();
	}

	assert(assertion: boolean, ...args: any[]) {
		if (assertion === false) {
			this.error(...args);
		}
	}

	async read() {
		this.builder.addFields({
			name: "Input: ",
			value: "Awaiting...",
		});
		await this.update();
		return new Promise<string>(resolve => {
			this.message.channel.client.once("messageCreate", m => {
				this.builder.spliceFields(-1, 1, {
					name: "Input: ",
					value: m.content,
				});
				this.update().then(() => {
					resolve(m.content);
				});
			});
		});
	}

	async run(message: Message<boolean>) {
		const presets: Babel.PluginItem[] = [];
		const type = message.content.slice(3, 5);
		const code = message.content.slice(6, -4);
		this.builder = new EmbedBuilder({
			author: {
				name: type === "ts" ? "TypeScript" : "JavaScript",
				iconURL:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/" +
					(type === "ts"
						? "4/4c/Typescript_logo_2020.svg/240px-Typescript_logo_2020.svg.png"
						: "6/6a/JavaScript-logo.png/240px-JavaScript-logo.png"),
				url: type === "ts" ? "https://www.typescriptlang.org/" : undefined,
			},
		});

		this.message = await message.reply({
			embeds: [this.builder],
		});

		if (type === "ts") {
			presets.push("@babel/preset-typescript");
		}

		try {
			const transpiled = await Babel.transformAsync(code, {
				filename: "message." + type,
				presets,
				plugins: ["@babel/plugin-syntax-top-level-await"],
			});
			var result = transpiled!.code || "";
		} catch (e: any) {
			var result = `console.error(${JSON.stringify(e.message)})`;
		}

		try {
			await new AsyncFunction("console", result)(this);
		} catch (e) {
			this.error(e);
		}
	}
}

function stringify(data: any) {
	if (Array.isArray(data)) {
		return JSON.stringify(data);
	}
	if (data.constructor === Object) {
		return JSON.stringify(data, undefined, "\t");
	}
	return String(data);
}

declare namespace Console {
	interface Data {
		type: string;
		data: string;
	}
}

export default Console;
