const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const db = require("../db");
const { sign, requireAuth } = require("../auth");

const router = express.Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Freia tentativas de força bruta: 20 por 15 min por IP */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  message: { erro: "Muitas tentativas. Aguarde alguns minutos." }
});

const publicUser = (u) => ({ id: u.id, nome: u.nome, email: u.email });

router.post("/register", limiter, (req, res) => {
  const nome = String(req.body.nome || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const senha = String(req.body.senha || "");
  const erros = {};
  if (nome.length < 2 || nome.length > 40) erros.nome = "Use de 2 a 40 caracteres.";
  if (!EMAIL.test(email)) erros.email = "Informe um e-mail válido.";
  if (senha.length < 6 || senha.length > 72) erros.senha = "A senha precisa ter de 6 a 72 caracteres.";
  if (Object.keys(erros).length) return res.status(400).json({ erro: "Dados inválidos.", campos: erros });

  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email))
    return res.status(409).json({ erro: "Este e-mail já está cadastrado.", campos: { email: "Este e-mail já está cadastrado." } });

  const info = db.prepare("INSERT INTO users (nome, email, senha_hash) VALUES (?, ?, ?)")
    .run(nome, email, bcrypt.hashSync(senha, 10));
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

router.post("/login", limiter, (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const senha = String(req.body.senha || "");
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  // Mesma resposta para e-mail inexistente e senha errada (não revela quais e-mails existem)
  if (!user || !bcrypt.compareSync(senha, user.senha_hash))
    return res.status(401).json({ erro: "E-mail ou senha incorretos." });
  res.json({ token: sign(user), user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(401).json({ erro: "Conta não encontrada." });
  res.json({ user: publicUser(user) });
});

/* Apaga a conta e todos os dados dela */
router.delete("/me", requireAuth, (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ?").run(req.userId);
  res.status(204).end();
});

module.exports = router;
