import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTO_FIXTURE = path.join(__dirname, 'fixtures', 'photo.png');

test.describe('StudioTerrain vertical slice', () => {
  test('client → project → observation → task → offline → sync', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Cockpit' })).toBeVisible();

    // 1. Seed a client. Clients now come exclusively from the Tally intake
    // forms (no manual-entry UI) — use the test-only seam instead.
    await page.waitForFunction(() => Boolean(window.__studioTerrainApi));
    await page.evaluate(() =>
      window.__studioTerrainApi!.clients.create({
        orgId: 'org-demo',
        name: 'Résidence Tremblay',
        contactIds: [],
      }),
    );

    // 2. Create a project + zone.
    await page.goto('/#/projects/new');
    await page.getByLabel('Client').selectOption({ label: 'Résidence Tremblay' });
    await page.getByLabel('Nom du projet').fill('Rénovation cuisine');
    await page.getByLabel('Première zone').fill('Cuisine');
    await page.getByRole('button', { name: 'Créer le projet' }).click();
    await expect(page.getByRole('heading', { name: 'Rénovation cuisine' })).toBeVisible();

    const projectUrl = page.url();
    const projectId = new URL(projectUrl).hash.split('/').pop() as string;

    // 3. Open the demo plan and drop a marker.
    await expect(page.getByRole('button', { name: 'Ouvrir le plan de démonstration' })).toBeVisible();
    await page.getByRole('button', { name: 'Ouvrir le plan de démonstration' }).click();
    await expect(page.getByRole('heading', { name: 'Plan de démonstration' })).toBeVisible();
    const planImage = page.getByAltText('Plan de démonstration du projet');
    const box = await planImage.boundingBox();
    if (!box) throw new Error('plan image not visible');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 3);
    await page.getByRole('button', { name: 'Créer une observation ici' }).click();

    // 4. Fill the observation with a photo + note.
    await expect(page.getByRole('heading', { name: 'Nouvelle observation' })).toBeVisible();
    await page.locator('#obs-photo').setInputFiles(PHOTO_FIXTURE);
    await page.getByLabel('Note').fill('Fini chêne naturel approuvé, sous réserve du prix.');
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.getByText('Fini chêne naturel approuvé')).toBeVisible();

    // 5. Assign a task to an intervenant.
    await page.getByRole('link', { name: 'Assigner une tâche' }).click();
    await page.getByLabel('Titre').fill('Vérifier la position électrique');
    await page.getByLabel('Intervenant assigné').fill('Électricité ABC');
    await page.getByRole('button', { name: 'Assigner' }).click();
    await expect(page.getByText('Vérifier la position électrique')).toBeVisible();

    // Wait for the service worker to take control so the app shell can be
    // served from cache once we go offline (data itself lives in IndexedDB,
    // independent of the service worker — see docs/ARCHITECTURE.md).
    await page.waitForFunction(
      () => 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null,
      { timeout: 15_000 },
    );

    // 6. Go offline, reload, and confirm the data survives with no network.
    // (navigator.onLine is not reliably updated by CDP network emulation in
    // all environments, so we assert on the thing that actually matters:
    // the app shell and IndexedDB data both load with zero network access.)
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Rénovation cuisine' })).toBeVisible();
    await expect(page.getByText('Fini chêne naturel approuvé')).toBeVisible();
    await expect(page.getByText('Vérifier la position électrique')).toBeVisible();

    // 7. Reload again to confirm persistence survives a full app close/reopen.
    await page.reload();
    await expect(page.getByText('Fini chêne naturel approuvé')).toBeVisible();

    // 8. Back online, trigger sync, confirm the status indicator updates.
    await context.setOffline(false);
    await page.goto('/#/sync');
    await expect(page.getByRole('main').getByText(/élément.*en attente/)).toBeVisible();
    await page.getByRole('button', { name: 'Synchroniser' }).click();
    await expect(page.getByRole('main').getByText('Synchronisé')).toBeVisible({ timeout: 15_000 });
  });
});
