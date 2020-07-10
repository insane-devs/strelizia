const { Client } = require('klasa');

Client.defaultPermissionLevels
	.add(9, ({ client, author }) => client.options.owners.includes(author.id));
