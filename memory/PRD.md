# Universal Tracker — PRD

## Visão
App mobile (Expo/React Native) para acompanhar filmes, séries, mangás e livros em um só lugar. Dados descobertos online (TMDB, AniList, Google Books) e persistidos localmente no dispositivo.

## Escopo desta entrega (Fase 1)
- Backend FastAPI atuando como proxy seguro para TMDB, AniList e Google Books (esconde as chaves).
- Frontend Expo com 4 abas: Explorar, Biblioteca, Favoritos, Quero Consumir.
- Tela **Explorar** completa: busca por título + chips de categoria (Filmes/Séries/Mangás/Livros) + destaques (trending) por categoria + grid híbrido 2 colunas.
- Tela de **Detalhes** (modal) com hero image + gradiente cinematográfico, metadados (ano, nota, gêneros), sinopse em pt-BR e botões: Adicionar à Biblioteca, Favoritar, Quero Consumir.
- Telas **Biblioteca / Favoritos / Quero Consumir** com filtros por categoria (Biblioteca também com ordenação por Recentes/Avaliação/Título) e estados vazios com CTA.
- Um mesmo item pode estar em **múltiplas listas simultaneamente** (Biblioteca + Favorito + Quero Consumir).
- Armazenamento **100% local** via AsyncStorage (persiste ao fechar o app, sem login).

## Backend (`/app/backend/server.py`)
Endpoints (todos com prefixo `/api`):
- `GET /search/movies?q=&page=` — TMDB movies (pt-BR)
- `GET /search/series?q=&page=` — TMDB tv (pt-BR)
- `GET /search/manga?q=&page=` — AniList GraphQL
- `GET /search/books?q=&page=` — Google Books
- `GET /search/all?q=` — busca paralela em todos
- `GET /detail/{type}/{external_id}` — detalhes por tipo
- `GET /trending` — trending semanal (movies+series) e listas populares (manga+books)

Chaves em `/app/backend/.env` (TMDB, Google Books, AniList URL).

## Frontend (`/app/frontend/app`)
- `_layout.tsx` — Stack root (SafeAreaProvider + GestureHandler + QueryClient + KeyboardProvider) com modal para detalhes.
- `index.tsx` — redireciona para `(tabs)/explorar`.
- `(tabs)/_layout.tsx` — bottom tabs (Explorar / Biblioteca / Favoritos / Quero Consumir).
- `(tabs)/explorar.tsx` — busca + chips + trending + grid.
- `(tabs)/biblioteca.tsx` — filtros + ordenação.
- `(tabs)/favoritos.tsx` — filtro por categoria.
- `(tabs)/quero-consumir.tsx` — filtro por categoria.
- `details/[type]/[id].tsx` — modal de detalhes.

Bibliotecas usadas: `expo-image`, `expo-linear-gradient`, `@tanstack/react-query`, `@react-native-async-storage/async-storage`, `react-native-safe-area-context`.

## Design
- Fundo `#09090E` (cinematic dark), accent `#9D4EDD` (violeta).
- Grid híbrido 2 colunas, poster 2:3, title + ano/rating abaixo.
- Badges por tipo (roxo/laranja/verde) e badges por status (biblioteca/favorito/quero).

## Fase 2 (entregue)
- **Progresso detalhado**: contador de episódios (séries), capítulos (mangás) e páginas (livros) na tela de detalhes (`ProgressTracker`), com barra, botões −/+, campo numérico e "Concluir". Filmes não têm contador. Cards da Biblioteca mostram progresso.
- **Para você** (5ª aba): `POST /api/recommend` recebe gêneros + notas dos favoritos (fallback: biblioteca) e devolve sugestões via TMDB discover / AniList genre_in / Google Books subject, excluindo itens já salvos. Tela mostra chips "Baseado em" e seções horizontais por tipo.
- **Notas pessoais**: nota 1–10 e resenha curta (280 chars) em `PersonalNotes`, persistidas em `SavedItem.user_rating` / `review`. Card mostra "Você N".
- **Compartilhar card**: `/share/[type]/[id]` renderiza `ShareCard` (poster + título + nota + resenha) e usa `react-native-view-shot` + `expo-sharing` para compartilhar (WhatsApp/Instagram). Na web exibe aviso (só funciona no app móvel).
- **Anúncios (AdMob)**: `react-native-google-mobile-ads` com `AdBanner.native.tsx` / `AdBanner.web.tsx`. Em Expo Go/web mostra placeholder; em build nativo usa `TestIds.BANNER` em dev e `EXPO_PUBLIC_ADMOB_*_BANNER_ID` em produção. App ID real do usuário (`ca-app-pub-8788879509634638~4069552533`) em `app.json` e banner (`.../5137248314`) em `.env`, mesmos IDs para Android e iOS.

## Fora do escopo desta entrega
- Reordenação drag-and-drop.
- Sincronização em nuvem / login.
- Notificações.

## Observações
- **Google Books**: a chave fornecida (`AIzaSy…hgGYo`) está no projeto Google Cloud `468838877937`, e a Books API precisa ser habilitada nesse projeto (`https://console.developers.google.com/apis/api/books.googleapis.com/overview?project=468838877937`). Enquanto não estiver habilitada, a categoria "Livros" mostra o estado de erro com botão "Tentar novamente".
