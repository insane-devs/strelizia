const { Task } = require('klasa');

module.exports = class extends Task {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run({ guild }) {
		const { music } = guild;
		if (music.queue.length) return null;
		if (music.textChannel) await music.textChannel.send('I have left the voice channel because of inactivity and to save resources.');
		return music.destroy();
	}

};
