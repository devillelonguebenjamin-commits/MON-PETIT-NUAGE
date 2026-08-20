# Mon Petit Nuage

Site de vente de coffrets mémoriels artisanaux pour les propriétaires de chiens et de chats.
Next.js 16 (App Router), TypeScript strict, Tailwind CSS 4, Supabase, Stripe.

- [Note de cadrage technique](docs/note-de-cadrage.md) — schéma de données, état du configurateur, stratégie de rendering, plan de tests, timeline et décisions actées.

## Démarrage rapide

```bash
npm ci
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev                  # http://localhost:3000
```

Le site démarre sans Supabase ni Stripe tant que vous ne visitez que les pages statiques
(`/`, `/design-system`) : la validation des variables d'environnement est paresseuse.

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Sert le build de production |
| `npm run lint` | ESLint (configuration Next + règles strictes maison) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Tests unitaires Vitest |
| `npm run test:e2e` | Parcours Playwright (nécessite un build préalable) |

Dans un conteneur où Chromium est déjà installé :

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium npm run test:e2e
```

## Variables d'environnement

Toutes décrites dans [`.env.example`](.env.example). En résumé :

| Variable | Portée | Rôle |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | publique | Metas, liens d'email, redirections Stripe |
| `NEXT_PUBLIC_SUPABASE_URL` | publique | Projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publique | Lecture du catalogue, soumise à la RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **serveur** | Écritures métier. Contourne la RLS : jamais exposée au client |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | publique | Stripe Elements |
| `STRIPE_SECRET_KEY` | **serveur** | Création des PaymentIntents |
| `STRIPE_WEBHOOK_SECRET` | **serveur** | Vérification de signature du webhook |
| `RESEND_API_KEY` | **serveur** | Emails transactionnels |
| `ORDER_TOKEN_SECRET` | **serveur** | Signature des liens de suivi de commande (clients invités) |

## Base de données

Le schéma vit dans [`supabase/migrations/`](supabase/migrations) et les données de départ dans
[`supabase/seed.sql`](supabase/seed.sql).

```bash
supabase link --project-ref <ref>
supabase db push                       # applique les migrations
psql "$DATABASE_URL" -f supabase/seed.sql
```

Trois principes structurants, détaillés au §1 de la note de cadrage :

1. **Le front n'envoie jamais de montant.** Il envoie des identifiants de produits ; le serveur
   recalcule le total via `src/lib/pricing.ts` et crée le PaymentIntent sur ce total.
2. **Aucune écriture client directe.** La clé anon ne sert qu'à lire le catalogue actif et les
   données dont l'utilisateur est propriétaire. Toute écriture passe par un Route Handler.
3. **Les photos d'animaux sont dans un bucket privé.** Upload et lecture par URL signée, après
   consentement explicite horodaté et versionné dans `media_assets`.

## Structure

```
src/
  app/                 Routes App Router
    design-system/     Référence visuelle des tokens et composants (non indexée)
  components/ui/       Composants de base réutilisables
  config/site.ts       Constantes de marque, TVA, livraison, délais
  lib/
    env.ts             Validation Zod des variables d'environnement
    pricing.ts         Moteur de prix unique, client et serveur
    validation.ts      Schémas Zod du configurateur et du checkout
    supabase/          Clients navigateur, serveur et administration
    types.ts           Types du domaine
supabase/              Migrations SQL et données de départ
tests/unit/            Vitest
tests/e2e/             Playwright
docs/                  Note de cadrage
```

## Design system

Les tokens sont définis une seule fois, dans le bloc `@theme` de `src/app/globals.css`.
Aucune couleur ne doit être écrite en dur dans un composant. La page `/design-system` sert de
référence visuelle en remplacement de Storybook au MVP (arbitrage 3 de la note de cadrage).

Points non négociables repris du brief : formes arrondies, whitespace généreux, vouvoiement,
formulations positives (« célébrer », « garder près de soi », « ceux qui nous ont quittés »), et
aucune imagerie funéraire.

## Qualité

La CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) exécute lint, typecheck, tests
unitaires, build et parcours Playwright sur chaque pull request.

Budgets à tenir, vérifiés manuellement en fin de semaine 3 : Lighthouse mobile 90+ sur `/`,
`/coffrets` et `/personnaliser`, WCAG AA sur l'ensemble du parcours d'achat.
