const { Command } = require('klasa');
const { EMOTES: { cross } } = require('#util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['MANAGE_ROLES'],
			permissionLevel: 6,
			description: 'Unlocks and allows everyone to speak in the whole server.',
			extendedHelp: 'No extended help available.',
			usage: ''
		});
	}

	async run(message) {
		if (message.guild.id !== '508495069914071040') return null;
		const everyone = message.guild.roles.cache.get(message.guild.id);
		if (everyone.permissions.serialize().SEND_MESSAGES) throw `${cross}  ::  The server is not currently locked.`;
		await everyone.setPermissions('SEND_MESSAGE', 'Strelizia lock command.');
		return message.send(`🔓  ::  Unlocked the server, server members can now speak.`);
	}

};
