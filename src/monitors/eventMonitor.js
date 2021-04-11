const { Monitor } = require('klasa');

const REACTIONS = ['510993024151453706', '545841442669461504'];
const no = '719909424889856011';
const days = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday'
];

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false
		});
	}

	async run(message) {
		if (!message.guild ||
			message.guild.id !== '508495069914071040' ||
			message.channel.id !== '815308859580874762') return null;
		if (!new RegExp(days.join('|')).test(message.content)) return null;
		if (/\b(nsfw|dick|pussy|naked)\b|(loli|tit)/.test(message.content)) return message.react(no);
		return Promise.all(REACTIONS.map(async emote => await message.react(emote)));
	}

};
