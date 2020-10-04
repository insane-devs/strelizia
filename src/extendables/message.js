// Copyright (c) 2017-2020 dirigeants. All rights reserved. MIT license.
const { Extendable } = require('klasa');
const { Message } = require('discord.js');
const EMOTES = {
	failure: '<:xmark:415894324719386634>',
	success: '<:checkmark:415894323436191755>',
	loading: '<a:typing:492356308943503370>'
};

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [Message] });
	}

	async ask(content, options) {
		const message = await this.sendMessage(content, options);
		if (this.channel.permissionsFor(this.guild.me).has('ADD_REACTIONS')) return awaitReaction(this, message);
		return awaitMessage(this);
	}

	async awaitReply(question, time = 60000, embed) {
		await (embed ? this.send(question, { embed }) : this.send(question));
		return this.channel.awaitMessages(message => message.author.id === this.author.id,
			{ max: 1, time, errors: ['time'] })
			.then(messages => messages.first().content)
			.catch(() => false);
	}

	async prompt(text, time = 30000) {
		const message = await this.channel.send(text);
		const responses = await this.channel.awaitMessages(msg => msg.author === this.author, { time, max: 1 });
		message.delete();
		if (responses.size === 0) throw this.language.get('MESSAGE_PROMPT_TIMEOUT');
		return responses.first();
	}

	async success(content, options) {
		return this.sendMessage(`${EMOTES.success} :: ${content}`, options);
	}

	async failure(content, options) {
		return this.sendMessage(`${EMOTES.failure} :: ${content}`, options);
	}

	async loading(content, options) {
		return this.sendMessage(`${EMOTES.loading} :: ${content}`, options);
	}

	async unreact(emojiID) {
		const reaction = this.reactions.get(emojiID);
		return reaction ? reaction.users.remove(this.client.user) : null;
	}

};

const awaitReaction = async (msg, message) => {
	await message.react('🇾');
	await message.react('🇳');
	const data = await message.awaitReactions(reaction => reaction.users.has(msg.author.id), { time: 20000, max: 1 });
	if (data.firstKey() === '🇾') return true;
	throw null;
};

const awaitMessage = async (message) => {
	const messages = await message.channel.awaitMessages(mes => mes.author === message.author, { time: 20000, max: 1 });
	if (messages.size === 0) throw null;
	const responseMessage = await messages.first();
	if (responseMessage.content.toLowerCase() === 'yes') return true;
	throw null;
};
