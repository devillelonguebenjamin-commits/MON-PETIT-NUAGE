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

  test('les boutons gardent leur couleur de texte quelle que soit la taille', async ({ page }) => {
    await page.goto('/design-system');

    // Régression : un token ambigu faisait écraser la couleur du texte par la
    // taille de police, donnant du terracotta sur terracotta.
    for (const name of ['Principal', 'Petit', 'Grand']) {
      const button = page.getByRole('button', { name, exact: true });
      const { color, background } = await button.evaluate((node) => {
        const style = getComputedStyle(node);
        return { color: style.color, background: style.backgroundColor };
      });

      expect(color).toBe('rgb(253, 252, 248)');
      expect(background).toBe('rgb(184, 80, 66)');
    }
  });

  test('le design system expose la palette et les composants', async ({ page }) => {
    await page.goto('/design-system');

    await expect(page.getByRole('heading', { name: 'Design system' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Principal' })).toBeVisible();
  });
});
