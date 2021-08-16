const { Command } = require('klasa');
const { EMOTES: { cross } } = require('#util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['MANAGE_ROLES'],
			permissionLevel: 6,
			description: 'Locks and prevent everyone from speaking in the whole server.',
			extendedHelp: 'This command denies Send Messages permissions from everyone, useful for spam raids.',
			usage: ''
		});
	}

	async run(message) {
		if (message.guild.id !== '508495069914071040') return null;
		const everyone = message.guild.roles.cache.get(message.guild.id);
		if (!everyone.permissions.serialize().SEND_MESSAGES) throw `${cross}  ::  The server is currently locked.`;
		await everyone.setPermissions('SEND_MESSAGES', 'Strelizia lock command.');
		return message.send(`🔒  ::  Successfully locked the server`);
	}

};
