import pg from 'pg';

const pool = new pg.Pool({
  user: 'daniel',
  host: 'localhost',
  database: 'scraper',
  password: '12345',
  port: 5432,
});

export default async function writeToDB(data, module) {
  const properties = Object.keys(data[0]);
  let createQuery = `CREATE TABLE ${module}(ID serial NOT NULL PRIMARY KEY`;
  let insertQuery = `INSERT INTO ${module} (`;
  for (const [i, prop] of properties.entries()) {
    createQuery = createQuery.concat(`, ${prop} VARCHAR(300)`);
    if (i + 1 === properties.length) {
      insertQuery = insertQuery.concat(`${prop}) VALUES `);
    } else {
      insertQuery = insertQuery.concat(`${prop}, `);
    }
  }
  for (const [i, item] of data.entries()) {
    insertQuery = insertQuery.concat(`(`);
    let counter = 0;
    // eslint-disable-next-line guard-for-in
    for (const prop in item) {
      counter += 1;
      if (item[prop] === '') {
        item[prop] = 'NA';
      }
      if (counter === properties.length) {
        insertQuery = insertQuery.concat(`$$${item[prop]}$$`);
      } else {
        insertQuery = insertQuery.concat(`$$${item[prop]}$$, `);
      }
    }
    if (i + 1 === data.length) {
      insertQuery = insertQuery.concat(`)`);
    } else {
      insertQuery = insertQuery.concat(`), `);
    }
  }
  createQuery = createQuery.concat(`)`);
  try {
    const res = await pool.query(createQuery);
    console.log(res.rows[0]);
  } catch (err) {
    console.log(err.stack);
  }
  try {
    const res = await pool.query(insertQuery);
    console.log(res.rows[0]);
  } catch (err) {
    console.log(err.stack);
  }
}
