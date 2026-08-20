import { expect, test } from '@playwright/test';

/**
 * Fumée : garantit que le socle rend correctement sur les deux profils.
 * Les parcours P1 à P6 de la note de cadrage arrivent avec le tunnel (S3-S4).
 */
test.describe('socle', () => {
  test('la page d’accueil rend le hero et les accès catalogue', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('souvenir');
    await expect(page.getByRole('link', { name: 'Découvrir nos coffrets' })).toBeVisible();
  });

  test('le lien d’évitement est atteignable au clavier', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    await expect(page.getByRole('link', { name: 'Aller au contenu principal' })).toBeFocused();
  });

  test('le design system expose la palette et les composants', async ({ page }) => {
    await page.goto('/design-system');

    await expect(page.getByRole('heading', { name: 'Design system' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Principal' })).toBeVisible();
  });
});
