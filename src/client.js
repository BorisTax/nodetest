const zmq = require("zeromq");
const rls = require('readline-sync');
const pubSocket = zmq.socket("pub");
const subSocket = zmq.socket("sub");
const pubPort = +process.argv[2];
const subPort = +process.argv[3];
if (!pubPort || !subPort || pubPort==subPort) {
  console.error('Incorrect ports!');
  process.exit();
}
pubSocket.connect(`tcp://127.0.0.1:${subPort}`);
subSocket.connect(`tcp://127.0.0.1:${pubPort}`);

subSocket.subscribe('api_out');
subSocket.on('message', (key, message) => {
  const res = JSON.parse(message.utf8Slice());
  if (res.status == 'ok') console.log('ok');
  else console.log(res.error);
  process.exit();
})

const login = rls.question('Login:');
const password = rls.question('Password:');
const msg = msgGenerate();
pubSocket.send(['api_in', `{"type":"login","email":"${login}","pwd":"${password}","msg_id":"${msg}"}`])

function msgGenerate() {
  const buffer = Buffer.alloc(20);
  for (let i = 0; i < 20; i++) {
    buffer.writeUInt8(Math.trunc(Math.random() * 256), i);
  }
  return buffer.base64Slice();
}
