import { expect, test } from '@playwright/test';

/**
 * Parcours P3 et P4 de la note de cadrage. L'étape 3 (photo) et le paiement
 * arrivent en semaine 3 ; P1, P2, P5 et P6 suivront avec eux.
 */
test.describe('configurateur', () => {
  test('préremplit le coffret choisi depuis une fiche produit', async ({ page }) => {
    await page.goto('/coffrets/coffret-douceur');
    await page.getByRole('link', { name: 'Personnaliser ce coffret' }).click();

    await expect(page).toHaveURL(/\/personnaliser\?coffret=coffret-douceur/);
    await expect(page.getByRole('radio', { name: /Coffret Douceur/ })).toBeChecked();
    await expect(page.getByText('149 €').first()).toBeVisible();
  });

  test('P3 — le bouton retour du navigateur revient à l’étape précédente', async ({ page }) => {
    await page.goto('/personnaliser');

    await page.getByRole('button', { name: 'Continuer' }).click();
    await expect(page).toHaveURL(/etape=2/);

    await page.getByText('Entre 5 et 15 kg', { exact: true }).click();
    await page.getByRole('button', { name: 'Continuer' }).click();
    await expect(page).toHaveURL(/etape=3/);

    // Le retour navigateur doit ramener à l'étape 2, pas faire sortir du tunnel.
    await page.goBack();
    await expect(page).toHaveURL(/etape=2/);
    await expect(page.getByRole('radio', { name: 'Entre 5 et 15 kg' })).toBeChecked();

    // Et l'état reste modifiable après ce retour.
    await page.getByText('Plus de 30 kg', { exact: true }).click();
    await page.getByRole('button', { name: 'Continuer' }).click();
    await expect(page).toHaveURL(/etape=3/);
  });

  test('P4 — la configuration survit à un rechargement', async ({ page }) => {
    await page.goto('/personnaliser?etape=2');

    await page.getByText('Entre 15 et 30 kg', { exact: true }).click();
    await page.getByText('Bois foncé', { exact: true }).click();

    await page.goto('/personnaliser?etape=4');
    await page.getByRole('textbox', { name: 'Son prénom' }).fill('Nala');

    await page.reload();

    await expect(page.getByRole('textbox', { name: 'Son prénom' })).toHaveValue('Nala');
    await expect(page.getByText('Entre 15 et 30 kg · Bois foncé')).toBeVisible();
  });

  test('le prix suit les choix, sans jamais refacturer une option comprise', async ({ page }) => {
    await page.goto('/personnaliser?coffret=coffret-signature&etape=5');

    const total = page.getByText('249 €');
    await expect(total.first()).toBeVisible();

    // L'empreinte est comprise dans le Signature : la case est cochée et bloquée.
    const empreinte = page.getByRole('checkbox', { name: 'Ajouter Empreinte de patte encadrée' });
    await expect(empreinte).toBeChecked();
    await expect(empreinte).toBeDisabled();

    await page.getByRole('checkbox', { name: 'Ajouter Bijou avec cendres' }).check();
    await expect(page.getByText('338 €').first()).toBeVisible();
  });

  test('la gravure s’affiche en direct dans l’aperçu', async ({ page }) => {
    await page.goto('/personnaliser?etape=4');

    await page.getByRole('textbox', { name: 'Son prénom' }).fill('Gribouille');
    await page.getByRole('textbox', { name: 'Une phrase, si vous le souhaitez' }).fill('Toujours près de nous');

    const preview = page.getByRole('img', { name: /Aperçu de la gravure/ });
    await expect(preview).toContainText('Gribouille');
    await expect(preview).toContainText('Toujours près de nous');
  });

  test('bloque l’avancée tant que le prénom manque', async ({ page }) => {
    await page.goto('/personnaliser?etape=4');

    await expect(page.getByRole('button', { name: 'Continuer' })).toBeDisabled();
    await expect(page.getByText('Indiquez son prénom pour continuer.')).toBeVisible();

    await page.getByRole('textbox', { name: 'Son prénom' }).fill('Nala');
    await expect(page.getByRole('button', { name: 'Continuer' })).toBeEnabled();
  });
});
