import { chromium } from 'playwright';

async function verifySocialDock() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Wait 2.5s for splash screen to dismiss or click skip if visible
  try {
    const skipBtn = await page.waitForSelector('text=تخطي ودخول المنصة', { timeout: 3000 });
    if (skipBtn) await skipBtn.click();
  } catch (e) {
    console.log('Splash auto-dismissed or skip button not present');
  }

  await page.waitForTimeout(1500);

  // Take screenshot of bottom footer showing the social dock
  console.log('Scrolling to footer...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'public/assets/aistudio/verified_footer_dock.jpg', fullPage: false });
  console.log('Captured footer dock screenshot');

  // Now click on "تواصل معنا والروابط" tab
  console.log('Finding Contact tab...');
  const contactTab = await page.waitForSelector('text=تواصل معنا والروابط');
  if (contactTab) {
    await contactTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'public/assets/aistudio/verified_contact_tab.jpg', fullPage: false });
    console.log('Captured contact tab screenshot');
  }

  await browser.close();
  console.log('Verification finished successfully!');
}

verifySocialDock().catch((err) => {
  console.error('Error in verification:', err);
  process.exit(1);
});
