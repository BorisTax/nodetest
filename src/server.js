const zmq = require('zeromq');
const sqlite3 = require('sqlite3');
const pubSocket = zmq.socket('pub');
const subSocket = zmq.socket('sub');
const pubPort = +process.argv[2];
const subPort = +process.argv[3];
if (!pubPort || !subPort || pubPort==subPort) {
  console.error('Incorrect ports!');
  process.exit();
}
pubSocket.bindSync(`tcp://127.0.0.1:${pubPort}`);
subSocket.bindSync(`tcp://127.0.0.1:${subPort}`);
const db = new sqlite3.Database('./db/test.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) console.error(err.message);
});

subSocket.subscribe('api_in');
subSocket.on('message', (topic, message) => {
  const data = JSON.parse(message.utf8Slice());
  const response = {};
  if (!data.email || !data.pwd) {
    response.msg_id = data.msg_id;
    response.status = "error";
    response.error = 'WRONG_FORMAT';
    pubSocket.send(['api_out', JSON.stringify(response)]);
    return;
  }
  if (data.type == 'login') {
    db.all(`SELECT * FROM user`, (err, rows) => {
      if (err) return console.error(err.message);
      let user_id;
      for (let row of rows)
        if (data.email == row.email && data.pwd == row.passw) user_id = row.user_id;
      response.msg_id = data.msg_id
      if (user_id) {
        response.user_id = user_id;
        response.status = "ok";
      } else {
        response.status = "error";
        response.error = 'WRONG_PWD';
      }
      pubSocket.send(['api_out', JSON.stringify(response)]);
    });
  }
});
