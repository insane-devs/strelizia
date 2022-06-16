import { createFunctionPrecondition } from '@sapphire/decorators';
import { UserError } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { envParseArray } from '../env-parser';

export function ModeratorOnly(): MethodDecorator {
	return createFunctionPrecondition(async (message: Message) => {
		if (
			!envParseArray('OWNERS').includes(message.author.id) ||
			!message.member!.permissions.toArray().some((perms) => ['MODERATE_MEMBERS', 'ADMINISTRATOR'].includes(perms))
		) {
			throw new UserError({ message: 'This command can only run by Moderators!', identifier: 'permissionsMissing' });
		}
		return true;
	});
}
