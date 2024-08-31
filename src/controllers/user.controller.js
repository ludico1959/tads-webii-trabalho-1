const fs = require("node:fs");
require("dotenv").config();
const { UserRepository, User } = require("../models/user.model");

class UserController {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async create(req, res) {
    const { type, name, cpf, emails, phones } = req.body;

    const user = new User(type, name, cpf, emails, phones);

    await this.userRepository.create(user);

    return res.status(201).redirect("/");
  }

  get(req, res) {
    const userId = req.params.id;

    const { user, emails, phones } = this.userRepository.get(userId);

    if (!user) {
      return res.status(404).send("Usuário não encontrado.");
    }

    return res.status(200).render("edit-user", { user, emails, phones });
  }

  async list(req, res) {
    const pageSize = process.env.ITEMS_PER_PAGE || 5;
    const selectedPage = req.params.page || 1;
    const offset = (selectedPage - 1) * pageSize;
    const users = await this.userRepository.list(offset, pageSize);
    const totalUsers = users.length;

    if (totalUsers === 0) {
      return res.status(404).send("Não há usuários a serem listados.");
    }

    const totalPages = Math.ceil(totalUsers / pageSize);

    return res.status(200).render("home", { users, totalPages, selectedPage });
  }

  update(req, res) {
    const userId = req.params.id;
    const { name, cpf, emails, phones } = req.body;

    const { user } = this.userRepository.get(userId);

    if (!user) {
      return res.status(404).send("Usuário não encontrado.");
    }

    if (user.type === "ADMIN" && user.name !== name && user.cpf !== cpf) {
      return res
        .status(403)
        .send("Nome e CPF de usuário ADMIN não pode ser alterado.");
    }

    this.userRepository.update(userId, name, cpf, emails, phones);

    return res.status(204).redirect("/");
  }

  async delete(req, res) {
    const userId = req.params.id;

    const { user } = await this.userRepository.get(userId);

    if (!user) {
      return res.status(404).send("Usuário não encontrado.");
    }

    if (user.type === "ADMIN") {
      return res.status(400).send("Não é permitido excluir usuários ADMIN.");
    }

    this.userRepository.delete(userId);

    return res.status(204).redirect("/");
  }

  renderAddPage(req, res) {
    return res.render("add-user");
  }

  async renderEditPage(req, res) {
    const userId = req.params.id;

    const { user, emails, phones } = await this.userRepository.get(userId);

    return res.render("edit-user", { user, emails, phones });
  }
  
  async renderRemovePage(req, res) {
    const userId = req.params.id;

    const { user, emails, phones } = await this.userRepository.get(userId);

    return res.render("remove-user", { userId, userName: user.name });
  }

  exportCSV(req, res) {

    const users = this.userRepository.list(); 

    const csvStream = fs.createWriteStream('./tmp/usuarios.csv');

    users.forEach(user => {
      const userData = `${user.type},${user.name},${user.cpf},${user.primary_phone},${user.primary_email}\n`;
      csvStream.write(userData);
    });

    csvStream.end();

    csvStream.on('finish', () => {
      res.download('./tmp/usuarios.csv', 'usuarios.csv', (err) => {
        if (err) {
          console.log('Erro ao baixar o arquivo CSV:', err);
          res.status(500).send('Erro ao exportar usuários como CSV');
        } else {
          console.log('Arquivo CSV exportado com sucesso');

          fs.unlink('./tmp/usuarios.csv', (unlinkErr) => {
            if (unlinkErr) {
              console.log('Erro ao excluir o arquivo CSV:', unlinkErr);
            }
          });
        }
      });
    });
};
}

module.exports = UserController;
