const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const NodeCache = require("node-cache");
const store_cache = new NodeCache({ stdTTL: 600 /* seconds = 10 minutes */ });

const mysql = require("mysql2");
const util = require("util");
const options = {
  host: process.env.MYSQL_HOST_URL,
  user: process.env.MYSQL_USER_URL,
  password: process.env.MYSQL_PASSWORD_URL,
  database: process.env.MYSQL_DATABASE_URL,
  connectionLimit: 100,
  multipleStatements: true,
  waitForConnections: true,
  queueLimit: 0,
};

console.log(options);
var pool = mysql.createPool(options);

pool.on("error", function (err) {
  if (err.fatal) {
    console.error(new Date(), "MySQL fatal error", err);
    setTimeout(() => {
      pool = mysql.createPool(options);
    }, 3000); // wait 10 seconds before trying to recreate
  }
});
let query = util.promisify(pool.query).bind(pool);

async function getStoreSelectorsData(sid) {
  let query_result = {};

  try {
    if (store_cache.has(sid)) {
      query_result = store_cache.get(sid);
    } else {
      let sql = `SELECT * FROM fs_graph.store_id WHERE site_id = ? and active = 1`;
      [query_result] = await query(sql, [sid]);
      store_cache.set(sid, query_result);
    }
    return query_result;
  } catch (error) {
    console.error("Error in getStoreData:", error);
    return {};
  }
}

module.exports = getStoreSelectorsData;
