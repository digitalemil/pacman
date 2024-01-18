const os = require('node:os'); 
const pg = require("pg");

/* DDL
export DATABASE_CONNECTIONSTRING='postgresql://...&application_name=Pacman'
export REGION=west4
export ZONE=eu-west
export CLOUD=gcp

Create database  if not exists pacman;
use pacman;
Create Table if not exists Userstats  (
		id UUID NOT NULL DEFAULT gen_random_uuid(),
		name STRING NOT NULL,
        txncount int DEFAULT 0,
		CONSTRAINT "primary" PRIMARY KEY (id)
	);
Create Table if not exists Highscores  (
		id UUID NOT NULL DEFAULT gen_random_uuid(),
		userid UUID NOT NULL REFERENCES Userstats (id),
		score BIGINT not null,
        level int DEFAULT 0,
        lives int DEFAULT 0,
        et int DEFAULT 0,
        region STRING,
		CONSTRAINT "primary" PRIMARY KEY (id)
	);
*/

let connectionsInUse= 0;
const connectionString = process.env.DATABASE_CONNECTIONSTRING;
const cp = new pg.Pool({
    connectionString,
    max: 8
})

cp.on('acquire', (client) => {
    connectionsInUse++;
});
cp.on('release', (err, client) => {
    connectionsInUse--;
});

async function executeQuery(con, query) {
    let start = Date.now();
   
    console.log("SQL: " + query.substring(0, Math.min(256, query.length)));

    if (query.length > 256) {
        console.log("\tQuery Truncated. Total length: " + query.length);
    }
    let res;
    try {
        res= await con.query(query);
    }
    catch(err) {
        console.log("Can't execute query: "+query.substring(0, Math.max(128, query.length)));
        console.log(err.toString());
        console.log("Duration: " + (Date.now() - start) + "ms.");
        return null;
    }
    console.log("Duration: " + (Date.now() - start) + "ms. Rows: " + res.rows.length);
    if (res.rows.length == 1) {
        let r = JSON.stringify(res.rows[0]);
        console.log("Row 0: " + JSON.stringify(res.rows[0]).substring(0, Math.max(256, r.length)));
    }
   
    return res;
}

async function saveHighscore(name, score, level) {
    try {

        con = await cp.connect();
        let ids= await executeQuery(con, "SELECT ID from Userstats where name='"+name+"';");
        let userid= new Object();

        if(ids!= undefined && ids!= null && ids.rows[0] != undefined && ids.rows[0]!= null) {
            userid.id= ids.rows[0].id;
            console.log("UserID: "+userid.id);

        } 
        else {
            userid= await createUser(name);    
            console.log("UserID: "+JSON.stringify(userid));       
        }
     
<<<<<<< HEAD
        let res=await executeQuery(con, "Insert INTO Highscores (userid, score, level, region) values ('"+userid.id+"', "+score+", "+level+", '"+process.env.REGION+"');" );
=======
        let res=await executeQuery(con, "Upsert  INTO Highscores (userid, score, level, region) values ('"+userid.id+"', "+score+", "+level+", '"+process.env.REGION+"');" );
>>>>>>> 6db5a591a973aadb7fe9fe127e26235f36e6a38b
        console.log(JSON.stringify(res));
    }
    catch (err) {
        console.log(err);
    }
    con.release();
};

async function getHighscores() {
    let scores= null;
    try {

        con = await cp.connect();
        let ret= await executeQuery(con, "SELECT u.name as name, h.score, h.level, h.lives from Highscores h left join Userstats u on h.userid=u.id ORDER BY score DESC limit 10;");

        scores= new Array()
        for(let i= 0; i< ret.rows.length; i++) {
            let row= new Object();
            row.name= ret.rows[i].name;
            row.score= ret.rows[i].score;
            row.level= ret.rows[i].level;
            row.lives= ret.rows[i].lives;
            row.host= os.hostname();
            row.zone= process.env.ZONE;
            row.cloud= process.env.CLOUD;
            scores.push(row);
            
        }
        console.log("Highscores: "+JSON.stringify(scores));
    }
    catch (err) {
        console.log(err);
    }
    con.release();
    return scores;
};

async function getLivestats() {
    let scores= null;
    try {

        con = await cp.connect();
        let ret= await executeQuery(con, "SELECT u.name as name, u.id as userid, u.txncount as txncount, h.score, h.level, h.lives, h.et from Highscores h left join Userstats u on h.userid=u.id ORDER BY score DESC limit 10;");

        scores= new Array()
        for(let i= 0; i< ret.rows.length; i++) {
            let row= new Object();
            row.name= ret.rows[i].name;
            row.score= ret.rows[i].score;
            row.level= ret.rows[i].level;
            row.lives= ret.rows[i].lives;
            row.et= ret.rows[i].et;
            row.userid= ret.rows[i].userid;
            row.txncount= ret.rows[i].txncount;
      
            row.host= os.hostname();
            row.zone= process.env.ZONE;
            row.cloud= process.env.CLOUD;
            scores.push(row);
            
        }
        console.log("Livestats: "+JSON.stringify(scores));
    }
    catch (err) {
        console.log(err);
    }
    con.release();
    return scores;
};

async function createUser(name) {
    let con= null;
    let id= "null";
    try {
        con = await cp.connect();
       
        let ids = await executeQuery(con, "INSERT INTO Userstats (name) Values ('"+name+"') RETURNING id;");
        id= ids.rows[0].id;
        console.log("User created with ID: "+ids.rows[0].id);
    }
    catch (err) {
        console.log(err);
    }
    if (undefined != con && con != null) {
        con.release();
    }
    return {id: id};

}

exports.getHighscores=  getHighscores;
exports.saveHighscore=  saveHighscore;
exports.getLivestats= getLivestats;
