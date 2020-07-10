const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			enabled: true,
			ignoreOthers: false
		});
	}

	async run(message) {
		const prefix = this.client.options.regexPrefix;
		if (!(prefix.test(message.content) && message.content.endsWith('?'))) return null;
		return this.client.commands.get('8ball').run(message);
	}

};
