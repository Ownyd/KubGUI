const singleton = { processes: [] };

const addProcess = (process) => {
  singleton.processes = singleton.processes
    .concat({ pid: process.pid, process});
}

const deleteProcess = (pid) => {
  singleton.processes = singleton.processes
    .filter(p => p.pid !== pid);
}

const findProcess = (pid) => {
  const processInfo = singleton.processes.find(p => p.pid === pid);

  if (!processInfo || !processInfo.pid) {
    return null;
  }
  return processInfo.process;
}

module.exports = { addProcess, deleteProcess, findProcess };
