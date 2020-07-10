const { Command, Stopwatch } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'update',
			enabled: true,
			runIn: ['text'],
			permissionLevel: 10,
			description: 'Pulls code from remote repository and reload modified pieces.',
			extendedHelp: 'No extended help available.'
		});
	}

	async run(message) {
		const pieces = [];
		const failed = [];
		const timer = new Stopwatch();
		const execCommand = await this.store.get('exec').run(message, ['git pull']);
		let possiblePieces = execCommand.content.match(/(?:[A-Z|a-z|0-9]*\.js)$/gm);

		if (possiblePieces) {
			possiblePieces = possiblePieces.map(name => name.replace('.js', ''));
		} else {
			return execCommand.content;
		}

		for (const pieceName of possiblePieces) {
			try {
				const itm = this.client.arguments.get('piece').run(pieceName, { name: 'Piece' }, message);
				await itm.reload();
				pieces.push(itm);
			} catch (err) {
				failed.push(pieceName);
			}
		}

		return message.channel.send([
			`Reloaded: ${pieces.map(piece => piece.name).join(', ')} in ${timer}`,
			`${failed.length ? `Something went wrong while reloading ${failed.map(piece => piece).join(', ')}` : ''}`
		].join('\n'));
	}

};
