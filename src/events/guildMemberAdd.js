const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(member) {
		if (member.guild.id !== '508495069914071040') return null;
		if (!member.guild.settings.get('raidmode')) return null;
		return member.roles.add('722635635781009428');
	}

};
