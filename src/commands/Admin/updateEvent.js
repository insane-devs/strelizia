const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text', 'dm', 'group'],
			aliases: ['ue'],
			permissionLevel: 6,
			description: 'Changes the message ID to use when sending the event top posters.',
			extendedHelp: 'No extended help available.',
			usage: '<ID:string{16,18}>'
		});
	}

	async run(message, [id]) {
		await this.client.settings.update('eventID', id);
		return message.success(`Changed message ID to \`${id}\``);
	}

};
