# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\login.test.js >> Módulo de Login >> debe iniciar sesión con credenciales válidas y redirigir
- Location: tests\login.test.js:4:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/home.*/
Received string:  "http://localhost:5173/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:5173/login"

```

```yaml
- text: LEVI'S
- textbox "EMAIL": prueba@levis.com
- textbox "CONTRASEÑA": tu_contraseña
- button "INGRESAR"
- text: ¿No tienes cuenta?
- link "Regístrate aquí":
  - /url: /registro
- link "¿Olvidaste tu contraseña?":
  - /url: /recuperar
- link "← Volver al inicio":
  - /url: /
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Módulo de Login', () => {
  4  |   test('debe iniciar sesión con credenciales válidas y redirigir', async ({ page }) => {
  5  |     
  6  |     // 1. Ir a la página principal (el landing)
  7  |     await page.goto('http://localhost:5173/');
  8  | 
  9  |     // 2. Hacer clic en el botón del landing usando getByRole('button')
  10 |     await page.getByRole('button', { name: 'INGRESAR A LA TIENDA' }).click();
  11 | 
  12 |     // 3. Rellenar los inputs de login
  13 |     await page.getByPlaceholder('EMAIL').fill('prueba@levis.com');
  14 |     await page.getByPlaceholder('CONTRASEÑA').fill('tu_contraseña');
  15 | 
  16 |     // 4. Hacer clic en el botón INGRESAR del formulario de login
  17 |     await page.getByRole('button', { name: 'INGRESAR' }).click();
  18 | 
  19 |     // 5. Validar que la URL cambió al home
> 20 |     await expect(page).toHaveURL(/.*\/home.*/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  21 | 
  22 |     // 6. Validar que se guardó el token de sesión
  23 |     const token = await page.evaluate(() => localStorage.getItem('token'));
  24 |     expect(token).toBeTruthy();
  25 |   });
  26 | });
```