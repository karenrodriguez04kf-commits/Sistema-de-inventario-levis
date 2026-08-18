const { Builder, By, until } = require('selenium-webdriver');

(async function testLoginCliente() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get('http://localhost:5173/');

        let btnLanding = await driver.wait(
            until.elementLocated(By.xpath("//button[normalize-space()='INGRESAR A LA TIENDA']")), 
            5000
        );
        await btnLanding.click();

        await driver.wait(until.elementLocated(By.css("input[placeholder='EMAIL']")), 5000);

        await driver.findElement(By.css("input[placeholder='EMAIL']")).sendKeys('nedyer@gmail.com');
        await driver.findElement(By.css("input[placeholder='CONTRASEÑA']")).sendKeys('123123');

        await driver.findElement(By.xpath("//button[normalize-space()='INGRESAR']")).click();

        await driver.wait(until.urlContains('/home/catalogo'), 8000);
        
        console.log('Login de cliente OK y redirección correcta.');
    } catch (err) {
        console.error('Falló el test de login:', err.message);
        process.exitCode = 1;
    } finally {
        await driver.quit();
    }
})();

