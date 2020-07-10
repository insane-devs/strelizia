const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text', 'dm', 'group'],
			permissionLevel: 10,
			description: 'Force post today\'s event top posters.',
			extendedHelp: 'No extended help available.'
		});
	}

	async run() {
		const guild = this.client.guilds.get('508495069914071040');
		const channel = guild.channels.get('534138604281266195');

		return channel.send(await this.client.tasks.get('topPosters').run({ guild: guild.id, force: true }));
	}

};
