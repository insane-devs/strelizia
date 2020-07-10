const { Client } = require('klasa');

Client.defaultClientSchema
	.add('eventID', 'string', { default: '' })
	.add('restart', folder => folder
		.add('message', 'messagepromise')
		.add('timestamp', 'bigint', { min: 0 }));
