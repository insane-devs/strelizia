import { inlineCode, underscore } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, Resolvers } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { badwords } from '../../badwords';

const HEXCODE_REGEX = /#?([\da-f]{6})/i;

@ApplyOptions<SubCommandPluginCommandOptions>({
	cooldownDelay: 3000,
	description: "Change your custom role's name, color or icon.",
	subCommands: ['rename', 'color', 'icon', 'add', 'remove', 'list	']
})
export class UserCommand extends SubCommandPluginCommand {
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

		if (url.success) {
			const { href } = url.value;
			if (role.unicodeEmoji) await role.setUnicodeEmoji(null);
			const roleUpdate = await role.setIcon(href, `Custom role name change requested by ${interaction.user.tag}.`).catch(() => null);
			if (!roleUpdate)
				return interaction.reply({
					content: 'Something went wrong when updating your custom role icon, perhaps the image is too big?',
					ephemeral: true
				});
			return interaction.reply({ content: 'Successfully changed your custom role icon!', ephemeral: true });
		}

		if (emoji.success && emoji.value.id) {
			const { animated, name, id } = emoji.value;
			const roleUpdate = await role
				.setIcon(
					`https://cdn.discordapp.com/emojis/${emoji.value.id}.png?size=56&quality=lossless`,
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
			const roleUpdate = await role
				.setUnicodeEmoji(emoji.value?.name!, `Custom role icon change requested by ${interaction.user.tag}.`)
				.catch(() => null);
			if (!roleUpdate)
				return interaction.reply({
					content: 'Something went wrong when updating your custom role icon, please try again later.',
					ephemeral: true
				});
			return interaction.reply({ content: `Successfully changed your custom role icon to ${emoji.value?.name}!`, ephemeral: true });
		}
	}

	public async getCustomUser(interaction: Command.ChatInputInteraction) {
		const guildSetting = await this.container.prisma.guilds.findUnique({ where: { id: interaction.guildId! } });
		const customRoleOwner = guildSetting?.customs.find((entry) => entry.id === interaction.user.id);

		return customRoleOwner || null;
	}

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
}
