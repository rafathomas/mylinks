# MeusLinks

**MeusLinks** é uma aplicação web do tipo *link na bio* (estilo Linktree): cada usuário cria uma página pública personalizada, acessível por uma URL curta (`meusite.com/seu-nome`), onde reúne todos os seus links importantes em um só lugar.

A plataforma oferece um painel completo para montar e publicar a página, acompanhar cliques em tempo real e gerenciar assinaturas pagas.

## Funcionalidades

- 🔗 **Página de links pública** com slug personalizado (`/{seu-nome}`)
- 🎨 **Personalização visual** — imagem de perfil, imagem de fundo e ordenação dos links via drag-and-drop
- 📊 **Analytics de cliques** — acompanhamento de acessos a cada link e às redes sociais
- 🚀 **Onboarding guiado** para novos usuários, com verificação de disponibilidade de slug
- 🔐 **Autenticação** completa (cadastro, login, logout) com proteção CSRF
- 💳 **Assinaturas e cobrança** integradas ao **Stripe** (com webhook)
- 📱 **Interface reativa** construída em React + Tailwind CSS

## Tecnologias

| Camada      | Stack                                   |
|-------------|-----------------------------------------|
| Backend     | PHP 8.2+, Laravel 12                    |
| Frontend    | React 19, Vite, Tailwind CSS 4          |
| Pagamentos  | Stripe                                  |
| Banco       | SQLite (padrão) / MySQL / PostgreSQL    |
| Testes      | PHPUnit, Vitest, Testing Library        |

## Pré-requisitos

- PHP **8.2** ou superior
- Composer
- Node.js + npm
- Uma conta Stripe (para a parte de cobrança)

## Como clonar o projeto

```bash
git clone <url-do-repositorio> MeusLinks
cd MeusLinks
```

## Instalação

A forma mais rápida é usar o script `setup` do Composer, que instala dependências, prepara o `.env`, gera a chave da aplicação, roda as migrations e faz o build do frontend:

```bash
composer setup
```

### Instalação manual (passo a passo)

Caso prefira fazer cada etapa manualmente:

```bash
# 1. Dependências PHP
composer install

# 2. Arquivo de ambiente
cp .env.example .env

# 3. Chave da aplicação
php artisan key:generate

# 4. Banco de dados (cria o arquivo SQLite, se necessário)
touch database/database.sqlite
php artisan migrate

# 5. Dependências e build do frontend
npm install
npm run build
```

### Configuração do Stripe

Adicione suas credenciais do Stripe ao arquivo `.env`:

```env
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Como usar

### Ambiente de desenvolvimento

Para subir tudo de uma vez (servidor PHP, fila, logs e Vite), use:

```bash
composer dev
```

Ou, se preferir rodar os processos separadamente:

```bash
# Servidor Laravel
php artisan serve

# Front-end com hot reload
npm run dev
```

A aplicação ficará disponível em **http://localhost:8000**.

### Fluxo de uso

1. Acesse a página inicial e crie sua conta (**/register**).
2. Complete o **onboarding** escolhendo o slug da sua página.
3. No **painel** (`/dashboard`), adicione e reordene seus links, personalize imagens de perfil/fundo.
4. Clique em **Publicar** para deixar a página no ar.
5. Sua página pública fica disponível em `http://localhost:8000/{seu-slug}`.

## Testes

```bash
# Testes do backend (PHPUnit)
composer test

# Testes do frontend (Vitest)
npm test
```

## Docker

O projeto inclui um `compose.yaml` (Laravel Sail). Para subir o ambiente com Docker:

```bash
./vendor/bin/sail up
```

## Licença

Software open-source licenciado sob a [licença MIT](https://opensource.org/licenses/MIT).