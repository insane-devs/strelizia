const { Command } = require('klasa');
const { ANSWERS } = require('#util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			cooldown: 7,
			aliases: ['magic8'],
			description: 'Ask the almighty 8ball with your questions.',
			usage: '<Question:string>'
		});
	}

	async run(message) {
		return message.send(ANSWERS[Math.floor(Math.random() * ANSWERS.length)]);
	}

};
