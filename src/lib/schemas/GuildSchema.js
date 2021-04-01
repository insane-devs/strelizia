const { Client } = require('klasa');
const { prefix } = require('../../../config');

Client.defaultGuildSchema
	.add('prefix', 'string', { default: prefix })
	.add('raidmode', 'boolean', { default: false })
	.add('watchlist', 'any', { default: [], array: true })
	.add('appeals', folder => folder
		.add('list', 'any', { default: [], array: true })
		.add('channel', 'textchannel', { default: null })
		.add('messageID', 'string', { default: null }))
	.add('watchdog', folder => folder
		.add('channel', 'textchannel', { default: null })
		.add('messageID', 'string', { default: null }));
