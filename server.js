const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONT = path.join(__dirname, "..", "..", "batuque");

/* CSP desligada: o front usa estilos/scripts inline e a API da Apple (iTunes via JSONP) */
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors());                       // permite abrir o front por file:// (origem "null") durante o desenvolvimento
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api", (req, res) => res.status(404).json({ erro: "Rota não encontrada." }));

/* Serve o front: abra http://localhost:3000 */
app.use(express.static(FRONT));

app.use((err, req, res, next) => {     // JSON malformado, etc.
  if (err.type === "entity.parse.failed") return res.status(400).json({ erro: "JSON inválido." });
  console.error(err);
  res.status(500).json({ erro: "Erro interno." });
});

app.listen(PORT, () => console.log(`Batuque rodando em http://localhost:${PORT}`));
