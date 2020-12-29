const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(member) {
		if (member.guild.id !== '508495069914071040') return;
		if (!member.roles.cache.has('509530263026532393')) await member.roles.add('509530263026532393');
		if (member.guild.settings.get('raidmode')) await member.roles.add('722635635781009428');
		if (member.user.username.toUpperCase() === 'MP5') await member.ban({ reason: 'raid account' });
	}

};

