# Batuque — Music Journal

Site front-end avaliador de música: biblioteca, resenhas, estatísticas de escuta, artistas, perfil e prévias de 30 s.
Front-end em HTML, CSS e JavaScript puros (sem frameworks, sem build) + **back-end opcional** em Node.js/Express/SQLite (pasta `backend/`) para contas reais e sincronização dos dados.

## Como abrir
**Com back-end (recomendado):**
```
cd backend
npm install
npm start
```
Depois abra http://localhost:3000. Detalhes e rotas em `backend/README.md`.

**Sem back-end:** abra `batuque/index.html` no navegador (funciona via `file://`; é preciso internet para a Apple e as fontes). Tudo fica só no `localStorage`, como antes.

## Integração com a Apple (iTunes Search API)
- Pesquisa de álbuns, faixas e artistas, prévias de 30 s e discografias, via JSONP (sem chave).
- Fila com no máximo 18 chamadas/min e 2 em paralelo, cache de 10 min, cancelamento de buscas antigas.
- Nenhum áudio é baixado ou guardado; no `localStorage` ficam só IDs e números.
- Atribuição "Provided courtesy of iTunes" exibida junto ao conteúdo da Apple.
- **Pendente:** o badge oficial da Apple (ver `batuque/assets/img/apple/LEIA-ME.txt`). Não foi desenhado nem improvisado.

## Telas
Início · Descobrir · Minha biblioteca · Página de álbum · Perfil · Resenhas · Playlists · Artistas (diretório) ·
Perfil do artista · Avaliar artista · Agora tocando · Estatísticas · Configurações ·
Entrar · Criar conta · Recuperar acesso · Monte seu perfil.
Com o servidor ligado, cadastro e login são **reais** (senha guardada só como hash no servidor) e os dados da conta sincronizam entre navegadores. Com o servidor desligado, a conta é **simulada** no navegador (`localStorage`) e nenhuma senha é guardada.

## Estrutura
```
batuque/
├── index.html
├── css/    tokens · base · layout · components · pages · auth · animations
├── js/     data · itunes · store · api · session · theme · player · components · router · app · motion
│   └── pages/  uma página por arquivo (inclui artista, avaliar-artista, login, criar-conta, ...)
└── assets/ img/capas · img/apple
backend/  src/server.js · db.js · auth.js · routes/auth.js · routes/data.js
```

## Animações
Já existiam: hover, entrada de página, `stagger`, contagem de números, shake em erro. Novas (`css/animations.css` + `js/motion.js`): barra de progresso entre páginas, cards que aparecem ao rolar, ripple nos botões, barrinha de tempo no toast, logo que gira no hover, "Carregando…" pulsando e a bolinha de sincronização no topo. Todas respeitam `prefers-reduced-motion`.
Notas e avaliações da comunidade são conteúdo de demonstração.
file:///C:/Users/giova/Downloads/Trabalho-Luis-Batuque-main/Trabalho-Luis-Batuque-main/Trabalho-Luis-Batuque-itunes/batuque/index.html#/descobrir
