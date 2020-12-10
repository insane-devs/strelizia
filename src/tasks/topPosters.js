const { Task, util: { codeBlock } } = require('klasa');

module.exports = class extends Task {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run({ guild, force = false }) {
		if (!this.client.settings.get('eventID')) return null;
		const _guild = this.client.guilds.get(guild);
		const eventChannel = _guild.channels.get('534138604281266195');
		const messages = [];
		const obj = {};
		const options = { limit: 100 };
		const lastPostID = this.client.settings.get('lastLeaderboardPost');
		let lastID = this.client.settings.get('eventID');
		let totalImages = 0;

		// eslint-disable-next-line no-constant-condition
		while (true) {
			try {
				if (lastID) options.after = lastID;
				const msgs = await eventChannel.messages.fetch(options, false);
				messages.push(...msgs.array());
				lastID = msgs.first().id;
			} catch (err) { break; }
		}

		const index = messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).findIndex(msg => msg.id === lastPostID);

		if (!force && index < 50) return null;

		messages.filter(msg => msg.attachments.size).forEach(msgs => {
			totalImages += msgs.attachments.size;
			if (!obj[msgs.author.tag]) obj[msgs.author.tag] = msgs.attachments.size;
			else obj[msgs.author.tag] += msgs.attachments.size;
		});

		const sorted = Object.entries(obj).filter(ent => ent[1] >= 2).sort((a, b) => b[1] - a[1]).map(data => `• ${data[0]}${''.padStart(40 - data[0].length, ' ')}:: ${data[1]} images`);

		await this.client.users.get('296862433136476160').send(`Successfully sent message in ${eventChannel}`);

		return eventChannel.send(`**Top Daily Posters in ${eventChannel}**\n\n*Total images posted: ${totalImages}*${codeBlock('asciidoc', sorted.join('\n'))}`)
			.then(async (msg) => {
				await this.client.settings.update('lastLeaderboardPost', msg.id);
				messages.length = 0;
				sorted.length = 0;
			})
			.catch(err => err);
	}

};
