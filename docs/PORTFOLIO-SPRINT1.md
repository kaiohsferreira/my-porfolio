# Portfolio Admin Backend — Sprint 1

## Visão Geral

Implementação do backend do painel Admin do portfólio dentro da solution ASP.NET Core 8 existente.
O sistema suporta **múltiplos portfólios** no mesmo banco de dados, com isolamento garantido pela entidade `Management` — cada usuário possui seu próprio `ManagementSelectedId` gravado no JWT, e todos os endpoints admin extraem o `managementId` exclusivamente desse claim, nunca do body da requisição (proteção contra IDOR).

---

## Módulos Implementados

### 1. PortfolioProfile

Perfil público do portfólio. Relação 1:1 com `Management`.

**Campos:**

| Campo | Tipo | Descrição |
|---|---|---|
| `FullName` | string | Nome completo |
| `Headline` | string | Título profissional (PT) |
| `HeadlineEn` | string | Título profissional (EN) |
| `Location` | string | Localização |
| `BioPt` | string | Biografia em português |
| `BioEn` | string | Biografia em inglês |
| `AvailableForWork` | bool | Disponível para trabalho |
| `SinceYear` | int? | Ano de início da carreira |
| `ProfileImageName` | string | Nome do arquivo de imagem (armazenado em `Directory/PortfolioProfile/Unique/{id}/`) |
| `ResumeFileName` | string | Nome do arquivo de currículo (armazenado em `Directory/PortfolioResume/Unique/{id}/`) |

**Endpoints Admin** — `[Authorize]` `admin/portfolio/profile`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/portfolio/profile` | Retorna o perfil do usuário autenticado |
| PUT | `/admin/portfolio/profile` | Cria ou atualiza o perfil (upsert) |
| POST | `/admin/portfolio/profile/image` | Upload de foto de perfil (base64) |
| DELETE | `/admin/portfolio/profile/image` | Remove a foto de perfil |
| POST | `/admin/portfolio/profile/resume` | Upload de currículo (base64) |
| DELETE | `/admin/portfolio/profile/resume` | Remove o currículo |

**Endpoint Público** — `[AllowAnonymous]` `public/portfolio/{slug}/profile`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/public/portfolio/{slug}/profile` | Retorna o perfil completo com stats e links sociais ativos |

---

### 2. ProfileStat

Estatísticas exibidas no perfil (ex: "5 anos de experiência", "30+ projetos"). Relação N:1 com `PortfolioProfile`.

**Campos:**

| Campo | Tipo | Descrição |
|---|---|---|
| `LabelPt` | string | Rótulo em português |
| `LabelEn` | string | Rótulo em inglês |
| `Value` | string | Valor da estatística |
| `Icon` | string | Identificador do ícone |
| `SortOrder` | int | Ordem de exibição |

**Endpoints Admin** — `[Authorize]` `admin/portfolio/profile/stats`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/portfolio/profile/stats` | Lista todas as estatísticas do portfólio |
| POST | `/admin/portfolio/profile/stats` | Cria uma nova estatística |
| PUT | `/admin/portfolio/profile/stats/{id}` | Atualiza uma estatística |
| DELETE | `/admin/portfolio/profile/stats/{id}` | Soft-delete de uma estatística |
| PUT | `/admin/portfolio/profile/stats/reorder` | Reordena as estatísticas em lote |

---

### 3. SocialLink

Links para redes sociais. Relação N:1 com `Management`.

**Campos:**

| Campo | Tipo | Descrição |
|---|---|---|
| `Platform` | string | Nome da plataforma (ex: GitHub, LinkedIn) |
| `Label` | string | Texto de exibição |
| `Url` | string | URL do perfil |
| `Icon` | string | Identificador do ícone |
| `IsActive` | bool | Visível publicamente |
| `SortOrder` | int | Ordem de exibição |

**Endpoints Admin** — `[Authorize]` `admin/portfolio/social-link`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/portfolio/social-link` | Lista todos os links |
| POST | `/admin/portfolio/social-link` | Cria um novo link |
| PUT | `/admin/portfolio/social-link/{id}` | Atualiza um link |
| DELETE | `/admin/portfolio/social-link/{id}` | Soft-delete de um link |
| PATCH | `/admin/portfolio/social-link/{id}/toggle` | Ativa/desativa visibilidade |
| PUT | `/admin/portfolio/social-link/reorder` | Reordena os links em lote |

**Endpoint Público** — `[AllowAnonymous]` `public/portfolio/{slug}/social-links`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/public/portfolio/{slug}/social-links` | Retorna apenas os links com `IsActive = true` |

---

## Resolução de Slug (PortfolioResolver)

Todos os endpoints públicos recebem um `{slug}` na rota. Esse slug corresponde ao campo `FantasyName` da entidade `Management`. O `PortfolioResolverService` resolve o slug para o `managementId` correspondente antes de qualquer operação.

**Condições para resolução:**
- `Management.FantasyName == slug`
- `Management.IsApproved == true`
- `Management.DisabledAt == null`

---

## Isolamento Multi-Portfólio

```
JWT Token
  └─ ClaimTypes.NameIdentifier (userId)
       └─ ApplicationUser.ManagementSelectedId
            └─ managementId usado em todos os filtros
```

Nenhum endpoint admin aceita `managementId` no body. O valor é sempre lido do JWT via `UserManager.FindByIdAsync()`. Isso previne que um usuário acesse ou altere dados de outro portfólio.

---

## Soft Delete

Todas as entidades herdam de `BaseEntities` que possui `DisabledAt`. A remoção nunca exclui o registro — chama `entity.Disable()` que define `DisabledAt = DateTime.Now`. Todas as queries filtram `DisabledAt == null`.

---

## Arquivos Estáticos

Imagens e currículos são gerenciados pelo `FileUniqueService` existente:

| Entidade | Diretório |
|---|---|
| Foto de perfil | `Directory/PortfolioProfile/Unique/{profileId}/` |
| Currículo | `Directory/PortfolioResume/Unique/{profileId}/` |

Os campos `ProfileImageName` e `ResumeFileName` armazenam apenas o nome do arquivo. A URL pública é construída em runtime pelo service.

---

## Banco de Dados

**Tabelas criadas pela migration `AddPortfolioSprint1`:**

| Tabela | Chave primária | Chave estrangeira |
|---|---|---|
| `portfolio_profiles` | `id` | `management_id` → `Managements` (CASCADE, único) |
| `profile_stats` | `id` | `portfolio_profile_id` → `portfolio_profiles` (CASCADE) |
| `social_links` | `id` | `management_id` → `Managements` (CASCADE) |

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | ASP.NET Core 8 |
| ORM | Entity Framework Core + Npgsql (PostgreSQL) |
| Autenticação | ASP.NET Identity + JWT Bearer |
| Mapeamento | AutoMapper (auto-scan por assembly) |
| Resultados | FluentResults (`Result<T>`) |
| Padrão de repo | Repository + `FilterRepository<T>` genérico |
| Deploy | Docker + Railway |
