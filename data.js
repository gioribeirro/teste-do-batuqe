/* Sincronização: o front guarda tudo em um objeto (biblioteca, resenhas, notas, favoritos...).
   Cada chave desse objeto vira uma linha em user_data. Só chaves da lista abaixo são aceitas. */
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");

const router = express.Router();
router.use(requireAuth);

const KEYS = new Set([
  "theme", "accent", "inheritCover", "density", "listening", "libFields", "saved", "favAlbums", "favTracks",
  "albumRatings", "trackRatings", "reviews", "savedReviews", "draft", "profile", "volume", "queue", "trackNotes",
  "replay", "playlistTracks", "playlistMeta", "playlistToggles", "pageColor", "following", "artistRatings",
  "artistDrafts", "plays", "privacy", "onboarded", "activity", "visited"
]);
const MAX_BYTES = 1024 * 1024; // 1 MB por chave

/* Tudo de uma vez: { dados: { chave: valor }, atualizado: { chave: "data" } } */
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT chave, valor, atualizado_em FROM user_data WHERE user_id = ?").all(req.userId);
  const dados = {}, atualizado = {};
  for (const r of rows) {
    try { dados[r.chave] = JSON.parse(r.valor); atualizado[r.chave] = r.atualizado_em; } catch (e) { /* ignora linha corrompida */ }
  }
  res.json({ dados, atualizado });
});

/* Grava só o que mudou: body = { mudancas: { chave: valor } } */
router.put("/", (req, res) => {
  const m = req.body && req.body.mudancas;
  if (!m || typeof m !== "object" || Array.isArray(m)) return res.status(400).json({ erro: "Envie { mudancas: { chave: valor } }." });

  const entradas = Object.entries(m);
  for (const [k, v] of entradas) {
    if (!KEYS.has(k)) return res.status(400).json({ erro: `Chave não permitida: ${k}` });
    if (Buffer.byteLength(JSON.stringify(v)) > MAX_BYTES) return res.status(413).json({ erro: `Valor grande demais: ${k}` });
  }
  const up = db.prepare(`
    INSERT INTO user_data (user_id, chave, valor, atualizado_em) VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT (user_id, chave) DO UPDATE SET valor = excluded.valor, atualizado_em = excluded.atualizado_em`);
  db.transaction(() => { for (const [k, v] of entradas) up.run(req.userId, k, JSON.stringify(v)); })();
  res.json({ ok: true, gravadas: entradas.length });
});

module.exports = router;
