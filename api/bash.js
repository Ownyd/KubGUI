const { spawn } = require('child_process');
const { addProcess, deleteProcess } = require('./processes.js')

async function bash(args) {
  const { name, context, namespace} = args;
  try {
    const process = spawn(`kubectl`, [`exec`, `--context=${context}`, '-n', `${namespace}`, `-i`,`${name}`, 'bash'], {
      stdio: [
        'pipe',
        'pipe',
        'pipe',
      ]
    })

    process.on('close', (code) => {
      if (!code) {
        console.log(`Process ${process.pid} terminated.`);
      }
      console.log(`Process ${process.pid } exited with code ${code}`);
      deleteProcess(process.pid);
    });
    addProcess(process);
    return process;
  } catch (e) {
    console.log(`ERROR Creating Process for ${context}/${namespace}/${name} :${e}`);
  }
}

module.exports = bash;
