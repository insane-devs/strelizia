const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false
		});
	}

	async run(message) {
		if (!await message.hasAtLeastPermissionLevel(6)) return null;
		if (!message.mentions.users.size) return null;
		return this.client.commands.get('birthday').run(message, message.mentions.users.first());
	}

};
