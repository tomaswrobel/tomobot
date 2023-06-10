import {type Message, EmbedBuilder, APIEmbedField, AttachmentBuilder} from "discord.js";
import * as Babel from "@babel/core";

const AsyncFunction = async function () {}.constructor as new (...args: string[]) => (
	...args: any[]
) => Promise<any>;

class Console {
	message!: Message;
	builder!: EmbedBuilder;
	data: APIEmbedField[] = [];

	async update() {
		if (this.data.length > 25) {
			this.data = this.data.slice(-25);
		}

		this.builder.setFields(this.data);

		if (this.message && this.builder) {
			await this.message.edit({
				embeds: [this.builder],
			});
		}
	}

	log(...args: any[]) {
		for (const arg of args) {
			this.data.push({
				name: "Console",
				value: stringify(arg),
			});
		}
		return this.update();
	}

	error(...args: any[]) {
		for (const arg of args) {
			this.data.push({
				value: stringify(arg),
				name: "Error",
			});
		}
		return this.update();
	}

	clear() {
		this.data.length = 0;
		return this.update();
	}

	warn(...args: any[]) {
		for (const arg of args) {
			this.data.push({
				value: stringify(arg),
				name: ":warning: Warn",
			});
		}
		return this.update();
	}

	async assert(assertion: boolean, ...args: any[]) {
		if (assertion === false) {
			await this.error(...args);
		}
	}

	async read() {
		this.data.push({
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
				plugins: [
					"@babel/plugin-syntax-top-level-await",
					{
						visitor: {
							// Since console functions are asynchronous, we need to await them
							CallExpression(path) {
								if (
									path.parent.type !== "AwaitExpression" &&
									path.node.callee.type === "MemberExpression" &&
									path.node.callee.object.type === "Identifier" &&
									path.node.callee.object.name === "console"
								) {
									path.replaceWith(Babel.types.awaitExpression(path.node));
								}
							},
							// Endless loop protection
							Loop(path) {
								const iterator = path.parentPath.scope.generateUidIdentifier("i");
								const body = path.get("body");

								path.insertBefore(
									Babel.types.variableDeclaration("let", [
										Babel.types.variableDeclarator(iterator, Babel.types.numericLiteral(0)),
									])
								);

								const guard = Babel.types.ifStatement(
									Babel.types.binaryExpression(
										">",
										Babel.types.updateExpression("++", iterator),
										Babel.types.numericLiteral(100000)
									),
									Babel.types.throwStatement(
										Babel.types.newExpression(Babel.types.identifier("Error"), [
											Babel.types.stringLiteral("Endless loop detected"),
										])
									)
								);

								if (body.isBlockStatement()) {
									body.node.body.unshift(guard);
								} else {
									body.replaceWith(Babel.types.blockStatement([guard, body.node]));
								}
							},
						},
					},
				],
			});
			var result = transpiled!.code || "";
		} catch (e: any) {
			var result = `console.error(${JSON.stringify(e.message)})`;
		}

		this.message.edit({
			files: [
				new AttachmentBuilder(Buffer.from(result), {
					name: "transpiled.js",
				}),
			],
		});

		try {
			await new AsyncFunction("console", result)(this);
		} catch (e) {
			await this.error(e);
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
