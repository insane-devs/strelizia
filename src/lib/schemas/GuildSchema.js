const { Client } = require('klasa');
const { prefix } = require('../../../config');

Client.defaultGuildSchema
	.add('prefix', 'string', { default: prefix })
	.add('raidmode', 'boolean', { default: false })
	.add('watchlist', 'any', { default: [], array: true })
	.add('watchdog', folder => folder
		.add('channel', 'textchannel', { defaut: null })
		.add('messageID', 'string', { default: null }));
