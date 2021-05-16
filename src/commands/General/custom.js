const { Command, util: { chunk }, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { EMOTES: { check, cross, typing } } = require('#lib/util/constants');
const badwords = require('../../../badwords');

const HEXCODE_REGEX = /#?([\da-f]{6})/i;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			cooldown: 3,
			permissionLevel: 0,
			description: "Change your custom role's name or color.",
			extendedHelp: 'No extended help available.',
			usage: '<rename|color|add|remove|list> [Member:member|Input:string] [Role:role|Input:string] [...]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async rename(message, [...name]) {
		const customRole = message.guild.settings.get('customs')
			.find(entry => entry.id === message.author.id);

		name = name.join(this.usageDelim);

		if (!name.length) throw `${cross}  ::  You must supply a new custom role name.`;
		if (name.length > 32) throw `${cross}  ::  New name must not exceed 32 characters. Please remove __${name.length - 32}__ characters.`;

		if (!customRole) return message.react('719909424889856011');

		if (badwords.test(name)) return message.react('719909424889856011');

		const role = message.guild.roles.cache.get(customRole.roleID);
		await role.setName(name, `Custom role name change requested by ${message.author.tag}.`)
			.catch((err) => {
				this.client.console.error(err);
				throw `${cross}  ::  Something went wrong when changing your custom role name. Please try again later.`;
			});

		return message.send(`${check}  ::  Successfully changed your custom role name!`);
	}

	async color(message, [color]) {
		const customRole = message.guild.settings.get('customs')
			.find(entry => entry.id === message.author.id);

		if (!customRole) return message.react('719909424889856011');

		if (!HEXCODE_REGEX.test(color)) throw `${cross}  ::  Please provide a proper hex color code. (e.g. \`#ef596f\`)`;

		const role = message.guild.roles.cache.get(customRole.roleID);
		await role.setColor(color, `Custom role color change requested by ${message.author.tag}.`)
			.catch((err) => {
				this.client.console.error(err);
				throw `${cross}  ::  Something went wrong when changing your custom role color. Please try again later.`;
			});

		return message.send(`${check}  ::  Successfully changed your custom role color!`);
	}

	async add(message, [member, role]) {
		if (!await message.hasAtLeastPermissionLevel(6)) return message.react('719909424889856011');

		if (!member) throw `${cross}  ::  Member is a required argument.`;
		if (!role) throw `${cross}  ::  Role is a required argument.`;

		if (message.guild.settings.get('customs').find(obj => Object.values(obj).some(id => id === member.id))) throw `${cross}  ::  Entry already exists in the database.`;

		await message.guild.settings.update('customs', { id: member.id, roleID: role.id }, message.guild, { action: 'add' });

		return message.send(`${check}  ::  Successfully added **${member.user.tag}**'s custom role to the database.`);
	}

	async remove(message, [arg]) {
		if (!await message.hasAtLeastPermissionLevel(6)) return message.react('719909424889856011');

		arg = arg.id || undefined;

		if (!arg) throw `${cross}  ::  Argument provided didn't return any results`;

		const memberOrRole = await this.client.arguments.get('member').run(arg, 'Member', message)
			.catch(() => undefined) ||
			await this.client.arguments.get('role').run(arg, 'Role', message)
				.catch(() => undefined);


		const entry = message.guild.settings.get('customs').find(obj => Object.values(obj).some(id => id === memberOrRole.id));

		if (!entry) throw `${cross}  ::  Entry does not exist in the database.`;

		await message.guild.settings.update('customs', entry, message.guild, { action: 'remove' });

		return message.send(`${check}  ::  Successfully removed custom role entry to the database.`);
	}

	async list(message) {
		if (!await message.hasAtLeastPermissionLevel(6)) return message.react('719909424889856011');

		const customs = message.guild.settings.get('customs');
		const chunked = chunk(customs, 10);

		if (!chunked.length) throw `${cross}  ::  Custom role database is empty.`;

		const display = new RichDisplay(new MessageEmbed());

		for (const arr of chunked) {
			display.addPage(embed => embed
				.setColor('BLUE')
				.setDescription(arr.map(entry => `<@${entry.id}> | <@&${entry.roleID}> (${entry.roleID})`)));
		}

		return display.run(await message.send(`${typing}  ::  Loading embed...`));
	}

};
