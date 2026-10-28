const oracledb = require('oracledb');
require('dotenv').config();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
async function run(){
  const conn = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
  });
  await conn.execute(`DELETE FROM books`);
  await conn.execute(`INSERT INTO books (title, author, genre, price, published_year, isbn, description) VALUES ('The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 'Technology', 45.99, 1999, '978-0201616224', 'A classic guide.')`);
  await conn.execute(`INSERT INTO books (title, author, genre, price, published_year, isbn, description) VALUES ('Clean Code', 'Robert C. Martin', 'Technology', 39.99, 2008, '978-0132350884', 'A handbook.')`);
  await conn.execute(`INSERT INTO books (title, author, genre, price, published_year, isbn, description) VALUES ('Dune', 'Frank Herbert', 'Sci-Fi', 24.50, 1965, '978-0441172719', 'Desert planet.')`);
  await conn.commit();
  console.log('3 books inserted via Node connection!');
  await conn.close();
}
run();