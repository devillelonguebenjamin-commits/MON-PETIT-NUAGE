import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * WCAG AA sur le parcours d'achat, exigence non négociable du brief.
 * Seules les violations critiques et sérieuses font échouer : les
 * signalements mineurs sont traités en revue, pas en bloquant de CI.
 */
const pages = [
  { path: '/', name: 'accueil' },
  { path: '/coffrets', name: 'catalogue' },
  { path: '/coffrets/coffret-signature', name: 'fiche produit' },
  { path: '/personnaliser?etape=1', name: 'configurateur, étape coffret' },
  { path: '/personnaliser?etape=4', name: 'configurateur, étape gravure' },
];

for (const page of pages) {
  test(`${page.name} ne présente aucune violation WCAG AA bloquante`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path);

    const results = await new AxeBuilder({ page: browserPage })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    );

    expect(
      blocking.map((violation) => `${violation.id} — ${violation.help}`),
      'violations WCAG critiques ou sérieuses',
    ).toEqual([]);
  });
}
