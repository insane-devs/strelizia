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
			ignoreOthers: false,
			ignoreWebhooks: false
		});
	}

	async run(message) {
		if (!message.guild && message.guild.id !== '508495069914071040') return null;

		// #appeals, #server-suggestions, and #advisor-polls
		if (['725353615304163328', '508873861979308032', '573221319441907732'].includes(message.channel.id)) return Promise.all(REACTIONS.map(async emote => await message.react(emote)));

		if (message.channel.id !== '815308859580874762') return null;
		if (!new RegExp(days.join('|')).test(message.content)) return null;
		if (/\b(nsfw|dick|pussy|naked)\b|(loli|tit)/.test(message.content)) return message.react(no);
		return Promise.all(REACTIONS.map(async emote => await message.react(emote)));
	}

};
