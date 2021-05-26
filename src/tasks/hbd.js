const { Task } = require('klasa');

module.exports = class extends Task {

	async run({ guildID, id }) {
		const guild = this.client.guilds.cache.get(guildID);
		const member = await guild.members.fetch(id);
		await member.roles.remove('789359547387084840');
	}

};
