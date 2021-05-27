const { Task, util: { codeBlock } } = require('klasa');

module.exports = class extends Task {

	constructor(...args) {
		super(...args);
		this.lb = {
			eventID: '',
			lastID: '',
			messages: [],
			posters: {},
			totalImages: 0
		};
	}

	async run({ guild, force = false }) {
		if (!this.client.settings.get('eventID')) return null;

		const _guild = this.client.guilds.cache.get(guild);
		const eventChannel = _guild.channels.cache.get('534138604281266195');
		const eventID = this.client.settings.get('eventID');
		const lastPostID = this.client.settings.get('lastLeaderboardPost');

		if (this.lb.eventID && this.lb.eventID !== eventID) {
			this._reset();
		} else {
			this.lb.eventID = eventID;
		}

		const options = { limit: 100 };

		// eslint-disable-next-line no-constant-condition
		while (true) {
			try {
				options.after = lastPostID || this.lb.lastID || eventID;
				const msgs = await eventChannel.messages.fetch(options, false);
				this.lb.messages.push(...msgs.array());
				this.lb.lastID = msgs.first().id;
			} catch (err) { break; }
		}

		// this.lb.messages.push(await eventChannel.messages.fetch(this.client.settings.get('eventID'), false));

		const index = this.lb.messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).findIndex(msg => msg.id === lastPostID);

		// Reset message array if index didn't exceed 50
		if (!force && index < 50 && index !== -1) {
			this.lb.messages = [];
			return null;
		}

		this.lb.messages.filter(msg => msg.attachments.size).forEach(msgs => {
			this.lb.totalImages += msgs.attachments.size;
			if (!this.lb.posters[msgs.author.id]) this.lb.posters[msgs.author.id] = msgs.attachments.size;
			else this.lb.posters[msgs.author.id] += msgs.attachments.size;
		});

		const sorted = await Promise.all(Object.entries(this.lb.posters).filter(ent => ent[1] >= 15).sort((a, b) => b[1] - a[1]).map(async data => {
			const user = (await this.client.users.fetch(data[0], false)).tag;
			return `• ${user}${''.padStart(40 - user.length, ' ')}:: ${data[1]} images`;
		}));

		await this.client.users.cache.get('296862433136476160').send(`Successfully sent message in ${eventChannel}`);

		return eventChannel.send(`**Top Daily Posters in ${eventChannel}**\n\n*Total images posted: ${this.lb.totalImages}*${codeBlock('asciidoc', sorted.join('\n'))}`)
			.then(async (msg) => {
				await this.client.settings.update('lastLeaderboardPost', msg.id);
				this.lb.messages = [msg];
				this.lb.lastID = msg.id;
				sorted.length = 0;
			})
			.catch(console.error);
	}

	_reset() {
		this.lb = {
			eventID: '',
			lastID: '',
			messages: [],
			posters: {},
			totalImages: 0
		};
	}

};
