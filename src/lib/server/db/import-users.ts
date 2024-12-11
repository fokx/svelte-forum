import * as dotenv from 'dotenv';
import { dbs } from './index.ts';
import { users } from './schema.ts';
import { promises as fs } from 'node:fs';

dotenv.config();

const filePath = 'msc/private/users.json';

function convertStringToDate(value) {
	if (value === null) {
		return null;
	}
	const date = new Date(value * 1000);
	if (isNaN(date.getTime())) {
		return null;
	}
	return date;
}

function convertStringToType(value) {
	if (value === 'true') {
		return true;
	} else if (value === 'false') {
		return false;
	} else if (!isNaN(value) && value.trim() !== '') {
		return Number(value);
	} else if (value === 'null') {
		return null;
	} else {
		return value;
	}
}

async function bulkInsertUsers(usersData) {
	const batchSize = 2000; // Adjust batch size as needed
	const totalUsers = usersData.length;
	let batch = [];

	await dbs.transaction(async (trx) => {
		for (let i = 0; i < totalUsers; i++) {
			const user = usersData[i];
			batch.push(user);

			if (batch.length === batchSize || i === totalUsers - 1) {
				await trx.insert(users).values(batch).onConflictDoUpdate({ target: users.id, set: user });
				batch = [];
			}
		}
	});
}

fs.readFile(filePath, 'utf8').then(async (data) => {
	const usersDataFromJson = JSON.parse(data);
	usersDataFromJson.forEach((user) => {
		user['created_at'] = convertStringToDate(user['created_at']);
		user['updated_at'] = convertStringToDate(user['updated_at']);
		user['silenced_till'] = convertStringToDate(user['silenced_till']);
		user['groups'] = JSON.stringify(user['groups']);
	});
	// for (const user of usersDataFromJson) {
	// 	await dbs.insert(users).values(user).onConflictDoUpdate({ target: users.id, set: user });
	// }
	await bulkInsertUsers(usersDataFromJson);
});