/* SQLite: arquivo único, sem servidor de banco para instalar. */
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const file = path.resolve(process.env.DB_FILE || path.join(__dirname, "..", "data", "batuque.db"));
fs.mkdirSync(path.dirname(file), { recursive: true });

const db = new Database(file);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    senha_hash TEXT    NOT NULL,
    criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Um registro por (usuário, chave do estado do front): biblioteca, resenhas, notas, favoritos, etc.
  CREATE TABLE IF NOT EXISTS user_data (
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chave         TEXT    NOT NULL,
    valor         TEXT    NOT NULL,            -- JSON
    atualizado_em TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, chave)
  );
`);

module.exports = db;
