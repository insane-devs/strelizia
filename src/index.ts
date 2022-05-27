import './lib/setup';
import { StreliziaClient } from './lib/structures/StreliziaClient';

const client = new StreliziaClient();

const main = async () => {
	try {
		client.logger.info('Logging in...');
		await client.login();
		client.logger.info('Logged in!');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
