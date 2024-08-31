const path = require("node:path");
const Database = require("better-sqlite3");

const db = new Database(path.resolve(__dirname, "../database/users.sqlite3"));

function createDatabaseTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT CHECK(type IN ('ADMIN', 'CLIENT')) NOT NULL,
      name VARCHAR(100) NOT NULL,
      cpf CHAR(11) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      email VARCHAR(100) NOT NULL,
      is_primary INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS phones (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      phone CHAR(11) NOT NULL,
      is_primary INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
}

function insertDatabaseData() {
  db.exec(`
    DELETE FROM emails;
    DELETE FROM phones;
    DELETE FROM users;

    DELETE FROM sqlite_sequence WHERE name='emails';
    DELETE FROM sqlite_sequence WHERE name='phones';
    DELETE FROM sqlite_sequence WHERE name='users';

    INSERT INTO users (name, cpf, type) VALUES ('João Silva', '12345678900', 'ADMIN');
    INSERT INTO emails (user_id, email, is_primary) VALUES (1, 'joao.silva@email.com', 1);
    INSERT INTO phones (user_id, phone, is_primary) VALUES (1, '53987654321', 1);

    INSERT INTO users (name, cpf, type) VALUES ('Maria Oliveira', '98765432100', 'CLIENT');
    INSERT INTO emails (user_id, email, is_primary) VALUES (2, 'maria.oliveira@email.com', 1);
    INSERT INTO phones (user_id, phone, is_primary) VALUES (2, '53912345678', 1);

    INSERT INTO users (name, cpf, type) VALUES ('Carlos Pereira', '45678912300', 'CLIENT');
    INSERT INTO emails (user_id, email, is_primary) VALUES (3, 'carlos.pereira@email.com', 1);
    INSERT INTO emails (user_id, email, is_primary) VALUES (3, 'carlos.pereira@gmail.com', 0);
    INSERT INTO phones (user_id, phone, is_primary) VALUES (3, '53998765432', 1);
  `);
}

createDatabaseTables();
insertDatabaseData();

module.exports = db;
