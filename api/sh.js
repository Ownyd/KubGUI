const { exec } = require('child-process-promise');

async function sh(cmd) {
	try {
		const result = await exec(cmd);
		const { stdout, stderr } = result;

		console.log(`[${(new Date).toISOString()}] / ${cmd} / OK`);
		return { data: stdout, error: stderr };
	} catch (e) {
		console.log(`[${(new Date).toISOString()}] / ${cmd} / Warning: KO\n${e.stderr}`);
		return { data: '', error: e.stderr };
	}
}

module.exports = sh;
