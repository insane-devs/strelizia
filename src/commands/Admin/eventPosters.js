const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text', 'dm', 'group'],
			aliases: ['tp'],
			permissionLevel: 10,
			description: 'Force post today\'s event top posters.',
			extendedHelp: 'No extended help available.'
		});
	}

	async run(message) {
		const guild = this.client.guilds.cache.get('508495069914071040');
		await this.client.tasks.get('topPosters').run({ guild: guild.id, force: true });
		return message.react('719909409509212190');
	}

};
