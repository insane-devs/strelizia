const answers = ['Yes', 'No', 'I doubt it.', `I don't think so..`, `It's a yes`, 'Perhaps', 'Never', 'Yep'];

const { Command } = require('klasa');

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
		return message.send(answers[Math.floor(Math.random() * answers.length)]);
	}

};
