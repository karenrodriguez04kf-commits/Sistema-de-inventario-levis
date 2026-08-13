import { test, expect } from '@playwright/test';

test.describe('Módulo de Login', () => {
  test('debe iniciar sesión con credenciales válidas de cliente y redirigir', async ({ page }) => {
    
    await page.goto('http://localhost:5173/');

    await page.getByRole('button', { name: 'INGRESAR A LA TIENDA' }).click();

    await page.getByPlaceholder('EMAIL').fill('nedyer@gmail.com');
    await page.getByPlaceholder('CONTRASEÑA').fill('123123');

    await page.getByRole('button', { name: 'INGRESAR' }).click();

    await expect(page).toHaveURL(/.*\/home\/catalogo.*/);

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });
});