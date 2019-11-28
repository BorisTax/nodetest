const sqlite3=require('sqlite3');
const db=new sqlite3.Database("../db/test.db",sqlite3.OPEN_READONLY,(err)=>{
  if(err)console.error(err.message);
});
db.all(`SELECT * FROM user`, (err, rows) => {
  if (err) {
    console.error(err.message);
  }

});
db.close();
