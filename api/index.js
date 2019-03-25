const sh = require('./sh.js');
const newbash = require('./bash.js');
const cors = require('cors');
const express = require('express');
const ws = require('ws');
const http = require('http');
const bodyParser = require('body-parser');
const { findProcess, deleteProcess } = require('./processes');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/bashCmd', async (req, res) => {
	const { pid, cmd } = req.body;
	const process = findProcess(pid);

	if (!process) {
		res.send(JSON.stringify({ error: true }));
	} else {
		process.stdin.write(`${cmd} && echo "\nDISPLAYNEWLINE"\n`);
		// process.stdin.write('echo ""\n');
		res.send(JSON.stringify({ error: false }));
	}
});

app.get('/namespace/current', async (req, res) => {
	const { context } = req.query;
	try {
		const { data } = await sh('kubectl config get-contexts');
		const arrayData = data.split('\n').slice(1).filter((s) => s !== '');
		const cleanData = arrayData.map((ctx) => ctx.split(' ').filter((c) => c !== '' && c !== '*'));
		const currentContext = cleanData.find(d => d[0] === context);
		const currentNamespace = currentContext[3];

		res.send([currentNamespace]);
	} catch (e) {() => null}
});

app.get('/namespaces', async (req, res) => {
	try {
		const { data } = await sh('kubectl get namespaces');
		const arrayData = data.split('\n').slice(1).filter((s) => s !== '');
		const objectData = arrayData.map(line => {
			const splittedLine = line.split(' ').filter(c => c !== '');
			return {
				name: splittedLine[0],
				active: splittedLine[1] === 'Active'
			}
		})
		const dataOmitDefault = objectData.filter(d => d.name !== 'default');
		res.send(dataOmitDefault);
	} catch (e) {() => null}
});

app.get('/context/current', async (req, res) => {
	try {
		const { data } = await sh('kubectl config current-context');
		res.send([data.trim()]);
	} catch (e) {() => null}
});

app.post('/context/change/:name', async (req, res) => {
	try {
		await sh(`kubectl config use-context ${name}`);
		res.send('OK');
	} catch (e) {() => null}
});

app.get('/contexts', async (req, res) => {
	try {
		const { data } = await sh('kubectl config get-contexts');
		const arrayData = data.split('\n').slice(1).filter((s) => s !== '');
		const objectData = arrayData.map((ctx) => {
			const splittedCtx = ctx.split(' ').filter((c) => c !== '' && c !== '*');
			return {
				name: splittedCtx[0],
				cluster: splittedCtx[1],
			}
		})
		res.send(objectData);
	} catch (e) {() => null}
});

app.get('/pods', async (req, res) => {
	const { context, namespace } = req.query

	const baseQuery = 'kubectl get pods';
	const contextSearch = ` --context=${context}`;
	const namespaceSearch = ` -n ${namespace}`;
	const query = baseQuery + (context ? contextSearch : '') + (namespace ? namespaceSearch : '');

	try {
		const { data } = await sh(query);
		const arrayData = data.split('\n').slice(1).filter((s) => s !== '');
		const objectData = arrayData.map((pod) => {
			const splittedPod = pod.split(' ').filter((c) => c !== '');
		return {
			name: splittedPod[0],
			ready: splittedPod[1],
			status: splittedPod[2],
			restarts: splittedPod[3],
			age: splittedPod[4]
		};
		})
		res.send(objectData);
	} catch (e) {() => null}
});


app.get('/pod/:name', async (req, res) => {
	const { name } = req.params;
	const { context, namespace } = req.query

	const baseQuery = `kubectl describe pod ${name}`
	const contextSearch = ` --context=${context}`;
	const namespaceSearch = ` -n ${namespace}`;
	const query = baseQuery + (context ? contextSearch : '') + (namespace ? namespaceSearch : '');

	try {
		const { data, error } = await sh(query);
		res.send(JSON.stringify({ error, data: data.split('\n')}));
	} catch (e) {() => null}
});

app.get('/pod/logs/:name', async (req, res) => {
	const { name } = req.params;
	const { context, namespace } = req.query

	const baseQuery = `kubectl logs ${name} --all-containers=true`
	const contextSearch = ` --context=${context}`;
	const namespaceSearch = ` -n ${namespace}`;
	const query = baseQuery + (context ? contextSearch : '') + (namespace ? namespaceSearch : '');

		const { data, error } = await sh(query);
		res.send(JSON.stringify({ error, data: data.split('\n') }));
});

const server = http.createServer(app);
const wss = new ws.Server({ server });

wss.on('connection', async (ws) => {
	console.log('WebSocket connected');

	ws.onmessage = async (event) => {
		const data = JSON.parse(event.data);
		const { name, context, namespace, connect } = data;

		if (connect === true) {
			const process = await newbash({ name, context, namespace });

			process.stdout.on('data', (data) => {
				ws.send(JSON.stringify({ data: data.toString() }));
			});
			process.stderr.on('data', (data) => {
				ws.send(JSON.stringify({ data: data.toString(), error: true }));
			});

			ws.onclose = function () {
				deleteProcess(process.pid);
				process.kill('SIGHUP');
				console.log('WebSocket closed');
			};

			console.log(`Process ${process.pid} started`);
			ws.send(JSON.stringify({ pid: process.pid }));
		}
	};

});


server.listen(8080, () => {
  console.log('Server started on port 8080');
});
