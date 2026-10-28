require('dotenv').config();
const oracledb = require('oracledb');

async function test() {
  console.log("Trying to connect with:");
  console.log("USER:", process.env.DB_USER);
  console.log("CONNECT STRING:", process.env.DB_CONNECT_STRING);
  console.log("PASSWORD:", process.env.DB_PASSWORD ? "**** loaded" : "NOT LOADED - .env problem!");

  try {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });
    console.log("\n✅ SUCCESS! Oracle Connected!");
    const result = await connection.execute("SELECT COUNT(*) AS TOTAL FROM books");
    console.log("Total books in Oracle:", result.rows);
    await connection.close();
  } catch (err) {
    console.log("\n❌ FAILED! Real Error is:");
    console.log(err.message);
    console.log("\nFull error:", err);
  }
}

test();