const { Event } = require('klasa');

module.exports = class extends Event {

	async run(oldState, newState) {
		if (oldState.member !== oldState.guild.me) return;
		if (!newState.channelID) await newState.guild.music.destroy();
	}

};
