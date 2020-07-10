const { Client } = require('klasa');
const { prefix } = require('../../../config');

Client.defaultGuildSchema
	.add('prefix', 'string', { default: prefix })
	.add('raidmode', 'boolean', { default: false });
