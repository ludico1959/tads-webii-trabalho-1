const db = require("../database/db");

class User {
  constructor(type, name, cpf, emails, phones) {
    this.type = type ? "ADMIN" : "CLIENT";
    this.name = name;
    this.cpf = cpf;
    this.emails = emails
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email);
    this.phones = phones
      .split('\n')
      .map(phone => phone.trim())
      .filter(phone => phone);
  }
}

class UserRepository {
  create(user) {
    const stmt = db.prepare(
      "INSERT INTO users (type, name, cpf) VALUES (?, ?, ?)"
    );

    const result = stmt.run(user.type, user.name, user.cpf);

     const { lastInsertRowid } = result;

    // Inserir emails e telefones associados
    const userId = lastInsertRowid;

    let isPrimaryEmail = true;
    let isPrimaryPhone = true;

    user.emails.forEach((email) => {
      db.prepare(
        "INSERT INTO emails (user_id, email, is_primary) VALUES (?, ?, ?)"
      ).run(userId, email, isPrimaryEmail ? 1 : 0);

      isPrimaryEmail = false;
    });

    user.phones.forEach((phone) => {
      db.prepare(
        "INSERT INTO phones (user_id, phone, is_primary) VALUES (?, ?, ?)"
      ).run(userId, phone, isPrimaryPhone ? 1 : 0);

      isPrimaryPhone = false;
    });
  }

  async get(userId) {
    const user = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(userId);

    const emails = await db
      .prepare("SELECT * FROM emails WHERE user_id = ?")
      .get(userId);

    const phones = await db
      .prepare("SELECT * FROM phones WHERE user_id = ?")
      .get(userId);
    
    return { user, emails, phones };
  }

  list(offset = 0, limit = 100) {
    return db
      .prepare(`
        SELECT u.id, u.type, u.name, u.cpf,
        (SELECT email FROM emails WHERE user_id = u.id AND is_primary = 1) as primary_email,
        (SELECT phone FROM phones WHERE user_id = u.id AND is_primary = 1) as primary_phone
        FROM users u LIMIT ? OFFSET ?
        `
      )
      .all(limit, offset);
  }

  update(userId, name, cpf, emails, phones) {
    db.prepare("UPDATE users SET name = ?, cpf = ? WHERE id = ?").run(
      name,
      cpf,
      userId
    );

    // Remover emails e telefones antigos do usuário
    db.prepare("DELETE FROM emails WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM phones WHERE user_id = ?").run(userId);

    // Inserir emails e telefones atualizados
    emails.forEach((email) => {
      db.prepare(
        "INSERT INTO emails (user_id, email, is_primary) VALUES (?, ?, ?)"
      ).run(userId, email.email, email.is_primary);
    });

    phones.forEach((phone) => {
      db.prepare(
        "INSERT INTO phones (user_id, phone, is_primary) VALUES (?, ?, ?)"
      ).run(userId, phone.phone, phone.is_primary);
    });
  }

  delete(userId) {
    db.prepare("DELETE FROM emails WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM phones WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  }
}

module.exports = { User, UserRepository };
