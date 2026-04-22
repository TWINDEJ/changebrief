import { chromium } from 'playwright';
import * as fs from 'fs';
import { extractStructure, stripNoise, type PageStructure } from './extract';

export interface ScreenshotOptions {
  selector?: string;   // CSS-selektor — screenshota bara detta element
  mobile?: boolean;    // mobil-viewport (375×812)
  headers?: Record<string, string>;
  cookies?: Array<{name: string; value: string; domain: string}>;
  waitForSelector?: string;
  waitMs?: number;     // extra ms att vänta efter page load (för SPA-init)
  scrollToBottom?: boolean; // scrolla genom hela sidan för att trigga lazy-load
  ignoreSelectors?: string[]; // dölj dessa element innan screenshot (klockor, cookie-banners, etc)
}

export interface ScreenshotResult {
  structurePath: string;
  structure: PageStructure;
}

export async function takeScreenshot(
  url: string,
  outputPath: string,
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Viewport: mobil eller desktop
  const viewport = options.mobile
    ? { width: 375, height: 812 }
    : { width: 1280, height: 900 };
  await page.setViewportSize(viewport);

  // Sätt cookies innan navigering
  if (options.cookies?.length) {
    await page.context().addCookies(options.cookies);
  }

  // Sätt extra HTTP-headers
  if (options.headers) {
    await page.setExtraHTTPHeaders(options.headers);
  }

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // Vänta på specifikt element om konfigurerat, annars 2 sekunder
  if (options.waitForSelector) {
    await page.waitForSelector(options.waitForSelector, { timeout: 10000 }).catch(() => {
      console.warn(`  ⚠ waitForSelector "${options.waitForSelector}" timeout — fortsätter ändå`);
    });
  } else {
    await page.waitForTimeout(2000);
  }

  // Extra wait för SPA:er som initialiserar efter networkidle (t.ex. hydration + data-fetch).
  if (options.waitMs && options.waitMs > 0) {
    await page.waitForTimeout(Math.min(options.waitMs, 15000));
  }

  // Scrolla genom hela sidan för att trigga lazy-load av bilder/innehåll.
  // Viewport-höjd steg i taget så IntersectionObserver-baserade loaders hinner trigga.
  if (options.scrollToBottom) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let total = 0;
        const step = window.innerHeight;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          total += step;
          if (total >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 200);
      });
    });
    await page.waitForTimeout(500); // liten paus så lazy content hinner rendera
  }

  // Dölj ignore-regions så de inte spökar i pixeldiffen.
  // visibility:hidden behåller layout — sidan hoppar inte när t.ex. en cookie-banner maskeras.
  if (options.ignoreSelectors?.length) {
    await page.evaluate((selectors: string[]) => {
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.visibility = 'hidden';
        });
      }
    }, options.ignoreSelectors);
  }

  // Ta screenshot
  if (options.selector) {
    const element = await page.$(options.selector);
    if (element) {
      await element.screenshot({ path: outputPath });
    } else {
      console.warn(`  ⚠ Selektor "${options.selector}" hittades inte — tar fullständig screenshot istället`);
      await page.screenshot({ path: outputPath, fullPage: false });
    }
  } else {
    await page.screenshot({ path: outputPath, fullPage: false });
  }

  // Extrahera strukturerad data från hela sidan (inte bara viewport)
  const rawStructure = await extractStructure(page);
  const structure = stripNoise(rawStructure);

  // Spara som JSON bredvid screenshoten
  const structurePath = outputPath.replace('.png', '.json');
  fs.writeFileSync(structurePath, JSON.stringify(structure, null, 2));

  await browser.close();
  console.log(`Screenshot sparad: ${outputPath}`);
  console.log(`Struktur sparad: ${structurePath} (${structure.prices.length} priser, ${structure.headings.length} rubriker, ${structure.buttons.length} knappar)`);

  return { structurePath, structure };
}
