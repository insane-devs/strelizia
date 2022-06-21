// ©
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Command, CommandOptions } from '@sapphire/framework';
import { Stopwatch } from '@sapphire/stopwatch';
import { inlineCode } from '@discordjs/builders';
import type { Args } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['r'],
	description: 'Reloads a piece.',
	preconditions: ['OwnerOnly']
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const params = await args.rest('string');
		const piece = this.locatePiece(params);
		const store = this.locateStore(params);

		if (params === 'everyting') {
			const timer = new Stopwatch();
			this?.reloadEverything();
			send(message, `Reloaded everything. (Took ${timer.stop()})`);
		}

		if (store) {
			const timer = new Stopwatch();
			await store.loadAll();
			return send(message, `Reloaded store: ${inlineCode(params)} (Took ${timer.stop()})`);
		}

		if (!piece) return send(message, `Unknown piece: ${inlineCode(params)}`);

		try {
			await piece.reload();
			const timer = new Stopwatch();

			return send(message, `Reloaded ${piece?.store.name.slice(0, -1)}: ${inlineCode(piece?.name)} (Took ${timer.stop()})`);
		} catch (err) {
			return send(message, `Failed to reload ${piece?.store.name.slice(0, -1)}: ${inlineCode(piece?.name)}.`);
		}
	}

	private async reloadEverything() {
		return Promise.all(this.container.stores.mapValues(async (store) => await store.loadAll()));
	}

	private locatePiece(parameter: string) {
		for (const store of this.container.stores.values()) {
			const piece = store.get(parameter);
			if (piece) return piece;
		}
		return null;
	}

	private locateStore(parameter: string) {
		for (const store of this.container.stores.values()) {
			if (store.name === parameter) return store;
		}
		return null;
	}
}
