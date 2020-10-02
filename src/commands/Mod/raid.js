const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			permissionLevel: 6,
			description: 'Enables anti-raid features for r/ZeroTwo',
			extendedHelp: 'No extended help available.',
			usage: '[off]',
			subcommands: true
		});
	}

	async run(message) {
		if (message.guild.id !== '508495069914071040' && !message.member.roles.cache.has('508800814421114887')) return null;
		if (message.guild.settings.get('raidmode')) throw 'Anti-raid is already enabled.';
		await message.guild.settings.update('raidmode', true);
		return message.send('🛡  ::  Anti-raid mode enabled.');
	}

	async off(message) {
		if (message.guild.id !== '508495069914071040' && !message.member.roles.cache.has('508800814421114887')) return null;
		if (!message.guild.settings.get('raidmode')) throw 'Anti-raid is already disabled.';
		await message.guild.settings.reset('raidmode');
		return message.success('Anti-raid mode disabled.');
	}

};
