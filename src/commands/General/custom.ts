import { inlineCode, underscore } from '@discordjs/builders';
import { ApplyOptions, RequiresUserPermissions } from '@sapphire/decorators';
import { Args, Command, Resolvers } from '@sapphire/framework';
import { badwords } from '../../badwords';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, Role, GuildMember, MessageEmbed } from 'discord.js';
import { chunk } from '@sapphire/utilities';
import { LazyPaginatedMessage } from '@sapphire/discord.js-utilities';
import { Subcommand, SubcommandOptions } from '@sapphire/plugin-subcommands';

const HEXCODE_REGEX = /#?([\da-f]{6})/i;

@ApplyOptions<SubcommandOptions>({
	cooldownDelay: 3000,
	description: "Change your custom role's name, color or icon.",
	preconditions: ['GuildOnly'],
	subcommands: [
		{ name: 'rename', chatInputRun: 'rename' },
		{ name: 'color', chatInputRun: 'color' },
		{ name: 'icon', chatInputRun: 'icon' },
		{ name: 'add', messageRun: 'add' },
		{ name: 'remove', messageRun: 'remove' },
		{ name: 'list', messageRun: 'list' }
	]
})
export class UserCommand extends Subcommand {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addSubcommand((command) =>
						command
							.setName('color')
							.setDescription('Change your role color.')
							.addStringOption((options) =>
								options.setName('color').setDescription('The new color of your role, must be a hex code.').setRequired(true)
							)
					)
					.addSubcommand((command) =>
						command
							.setName('rename')
							.setDescription('Rename your role.')
							.addStringOption((options) => options.setName('name').setDescription('The new name of your role.').setRequired(true))
					)
					.addSubcommand((command) =>
						command
							.setName('icon')
							.setDescription('Change your role icon.')
							.addStringOption((options) =>
								options.setName('icon').setDescription('The new icon for your role, can be an emoji or a URL.').setRequired(true)
							)
					),
			{
				guildIds: ['508495069914071040']
			}
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputInteraction) {
		const subcommand = interaction.options.getSubcommand(true);

		switch (subcommand) {
			case 'rename':
				return await this.rename(interaction);
			case 'color':
				return await this.color(interaction);
			case 'icon':
				return await this.icon(interaction);
			default:
				return interaction.reply({ content: 'Invalid subcommand.', ephemeral: true });
		}
	}

	@RequiresUserPermissions('MODERATE_MEMBERS')
	public async add(message: Message, args: Args) {
		if (message.guildId !== '508495069914071040' || !message.member?.permissions.has('MODERATE_MEMBERS')) return;
		const member = await args.pick('member');
		const role = await args.rest('role');

		const guildSettings = await this.container.prisma.guilds.findUnique({ where: { id: message.guildId! } });
		const memberExists = guildSettings?.customs.some((data) => data.id === member.id);
		if (memberExists) return send(message, { content: 'Member already exists in the database.' });

		await this.container.prisma.guilds
			.update({
				where: { id: message.guildId! },
				data: {
					customs: {
						push: { id: member.id, roleID: role.id }
					}
				}
			})
			.catch(() => {
				return send(message, { content: 'An error occured when adding member to the database.' });
			});

		return send(message, { content: 'Successfully added member to the database.' });
	}

	@RequiresUserPermissions('MODERATE_MEMBERS')
	public async remove(message: Message, args: Args) {
		if (message.guildId !== '508495069914071040' || !message.member?.permissions.has('MODERATE_MEMBERS')) return;
		const memberOrRole = await args.rest(UserCommand.memberOrRole);

		const guildSettings = await this.container.prisma.guilds.findUnique({ where: { id: message.guildId! } });
		const memberOrRoleExists = guildSettings?.customs.some((data) => [data.id, data.roleID].includes(memberOrRole.id));
		if (!memberOrRoleExists) return send(message, { content: 'Member or role does not exist in the database.' });

		await this.container.prisma.guilds
			.update({
				where: { id: message.guildId! },
				data: {
					customs: {
						deleteMany: { where: { id: memberOrRole.id, OR: { roleID: memberOrRole.id } } }
					}
				}
			})
			.catch(() => {
				return send(message, { content: 'An error occured when adding member to the database.' });
			});

		return send(message, { content: 'Successfully removed entry to the database.' });
	}

	@RequiresUserPermissions('MODERATE_MEMBERS')
	public async list(message: Message) {
		if (message.guildId !== '508495069914071040') return;

		const msg = await send(message, 'Loading list...');

		const guildSettings = await this.container.prisma.guilds.findUnique({ where: { id: message.guildId } });
		if (!guildSettings?.customs.length) return send(message, 'Custom list is empty.');

		const customChunks = chunk(guildSettings?.customs!, 10);
		const paginatedMessage = new LazyPaginatedMessage({
			template: new MessageEmbed()
				.setAuthor({ name: 'Custom role list', iconURL: message.guild?.iconURL({ dynamic: true })! })
				.setColor('RANDOM')
		});

		for (const chunk of customChunks) {
			paginatedMessage.addPageEmbed((embed) => {
				embed.setDescription(chunk.map((data) => `• <@!${data.id}> | <@&${data.roleID}> (${data.roleID})`).join('\n'));
				return embed;
			});
		}

		return paginatedMessage.run(msg).catch((err) => this.container.logger.error(err));
	}

	private async rename(interaction: Command.ChatInputInteraction) {
		const newName = interaction.options.getString('name')!;
		const roleOwner = await this.getCustomUser(interaction);

		if (!roleOwner) return interaction.reply({ content: 'You do not have a custom role.', ephemeral: true });
		if (badwords.test(newName)) return interaction.reply({ content: 'Role name must not contain any offensive content.', ephemeral: true });

		const role = interaction.guild?.roles.cache.get(roleOwner.roleID!)!;

		if (newName.length > 32)
			return interaction.reply({
				content: `New name must not exceed 32 characters. Please remove ${underscore((newName.length - 32).toString())} characters.`,
				ephemeral: true
			});

		const nameUpdate = await role.setName(newName, `Custom role name change requested by ${interaction.user.tag}.`).catch(() => null);
		if (!nameUpdate)
			return interaction.reply({ content: 'Something went wrong when updating your role name, please try again later.', ephemeral: true });

		return interaction.reply({ content: `Successfully changed your custom role name to ${inlineCode(newName)}!`, ephemeral: true });
	}

	private async color(interaction: Command.ChatInputInteraction) {
		const newColor = interaction.options.getString('color')!;
		const roleOwner = await this.getCustomUser(interaction);

		if (!roleOwner) return interaction.reply({ content: 'You do not have a custom role.', ephemeral: true });
		if (!HEXCODE_REGEX.test(newColor))
			return interaction.reply({ content: 'Please provide a proper hex color code. (e.g. `#ef596f`)', ephemeral: true });

		const role = interaction.guild?.roles.cache.get(roleOwner.roleID!)!;

		const colorUpdate = await role.setColor(`#${newColor}`, `Custom role color change requested by ${interaction.user.tag}.`).catch(() => null);
		if (!colorUpdate)
			return interaction.reply({ content: 'Something when wrong when updating your role color, please try again later.', ephemeral: true });

		return interaction.reply({ content: `Successfully changed your custom role color to ${inlineCode(newColor)}!`, ephemeral: true });
	}

	private async icon(interaction: Command.ChatInputInteraction) {
		const newIcon = interaction.options.getString('icon')!;
		const roleOwner = await this.getCustomUser(interaction);
		if (!roleOwner) return interaction.reply({ content: 'You do not have a custom role.', ephemeral: true });

		const url = Resolvers.resolveHyperlink(newIcon);
		const emoji = Resolvers.resolveEmoji(newIcon);

		const role = interaction.guild?.roles.cache.get(roleOwner.roleID!)!;

		if (url.isOk()) {
			const { href } = url.unwrap();
			if (role.unicodeEmoji) await role.setUnicodeEmoji(null);
			const roleUpdate = await role.setIcon(href, `Custom role name change requested by ${interaction.user.tag}.`).catch(() => null);
			if (!roleUpdate)
				return interaction.reply({
					content: 'Something went wrong when updating your custom role icon, perhaps the image is too big?',
					ephemeral: true
				});
			return interaction.reply({ content: 'Successfully changed your custom role icon!', ephemeral: true });
		}

		if (emoji.isOkAnd((emoji) => !!emoji.id)) {
			const { id, animated, name } = emoji.unwrap();
			const roleUpdate = await role
				.setIcon(
					`https://cdn.discordapp.com/emojis/${id}.png?size=56&quality=lossless`,
					`Custom role name change requested by ${interaction.user.tag}.`
				)
				.catch(() => null);
			if (!roleUpdate)
				return interaction.reply({
					content: 'Something went wrong when updating your custom role icon, please try again later.',
					ephemeral: true
				});
			return interaction.reply({
				content: `Successfully changed your custom role icon to <${animated ? 'a' : ''}:${name}:${id}>!`,
				ephemeral: true
			});
		} else {
			const { name } = emoji.unwrap();
			const roleUpdate = await role.setUnicodeEmoji(name, `Custom role icon change requested by ${interaction.user.tag}.`).catch(() => null);
			if (!roleUpdate)
				return interaction.reply({
					content: 'Something went wrong when updating your custom role icon, please try again later.',
					ephemeral: true
				});
			return interaction.reply({ content: `Successfully changed your custom role icon to ${name}!`, ephemeral: true });
		}
	}

	public async getCustomUser(interaction: Command.ChatInputInteraction) {
		const guildSetting = await this.container.prisma.guilds.findUnique({ where: { id: interaction.guildId! } });
		const customRoleOwner = guildSetting?.customs.find((entry) => entry.id === interaction.user.id);

		return customRoleOwner || null;
	}

	private static memberOrRole = Args.make<Role | GuildMember>(async (parameter, { argument, message }) => {
		const tryRole = await Resolvers.resolveRole(parameter, message.guild!);
		const tryMember = await Resolvers.resolveMember(parameter, message.guild!);

		if (tryRole.isOk()) return Args.ok(tryRole.unwrap());
		else if (tryMember.isOk()) return Args.ok(tryMember.unwrap());
		else
			return Args.error({
				argument,
				parameter,
				identifier: 'MemberOrRoleError',
				message: 'The provided argument was neither a GuildMember nor a Role.'
			});
	});
}
