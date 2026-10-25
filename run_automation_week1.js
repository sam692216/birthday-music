const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { NOVEMBER_WEEK1_DATA } = require('./november_week1_data.js');

async function main() {
  console.log('====================================================');
  console.log(' 🚀 啟動 11/1 ~ 11/7 全流程自動化生產引擎');
  console.log('====================================================');

  const baseDir = path.resolve(__dirname);
  const templateDir = path.join(baseDir, 'template');
  const postOutDir = path.join(baseDir, 'output_cards_11', 'post_4x5');
  const storyOutDir = path.join(baseDir, 'output_cards_11', 'story_9x16');

  // 1. 產生 1101 ~ 1107 網頁資料夾
  console.log('\n[1/4] 正在批量產出 11/1 ~ 11/7 專屬能量音樂夾網頁...');
  const tplIndex = fs.readFileSync(path.join(templateDir, 'index.html'), 'utf8');
  const tplStyles = fs.readFileSync(path.join(templateDir, 'styles.css'), 'utf8');
  const tplApp = fs.readFileSync(path.join(templateDir, 'app.js'), 'utf8');

  NOVEMBER_WEEK1_DATA.forEach(d => {
    const dayFolder = path.join(baseDir, d.dayId);
    const assetsFolder = path.join(dayFolder, 'assets');
    if (!fs.existsSync(assetsFolder)) fs.mkdirSync(assetsFolder, { recursive: true });

    // 寫入 index.html, styles.css, app.js
    fs.writeFileSync(path.join(dayFolder, 'index.html'), tplIndex, 'utf8');
    fs.writeFileSync(path.join(dayFolder, 'styles.css'), tplStyles, 'utf8');
    fs.writeFileSync(path.join(dayFolder, 'app.js'), tplApp, 'utf8');

    // 建立 data.js
    const cardData = {
      title: `${d.dateFormatted}｜${d.headline}`,
      dateEyebrow: d.dateEyebrow,
      numberLabel: d.numberLabel,
      flow: d.flow,
      headline: d.headline,
      birthdayKeywords: d.birthdayKeywords,
      flowKeywords: d.flowKeywords,
      boardQuote: d.boardQuote,
      reminder: d.reminder,
      annualQuestion: d.annualQuestion,
      wish: d.wish,
      signature: d.signature,
      imageAlt: d.imageAlt,
      shareLead: `🎂 ${d.dateFormatted}生日快樂！${d.headline}`,
      hashtags: `#${d.dateFormatted}生日快樂 #生命靈數 #流年${d.flow} #能量DJ點播站 #阿福教練`,
      scenarios: d.scenarios,
      tracks: d.tracks
    };

    fs.writeFileSync(
      path.join(dayFolder, 'data.js'),
      `window.CARD_DATA = ${JSON.stringify(cardData, null, 2)};\n`,
      'utf8'
    );
  });
  console.log('✅ 7 個音樂夾網頁資料夾（1101 ~ 1107）打包就緒！');

  // 2. 啟動 Playwright 渲染圖卡 (使用系統現成的 Chrome)
  console.log('\n[2/4] 啟動系統 Chrome 後台，自動渲染 14 張高清圖卡與 7 張音樂夾封面...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage();

  for (const d of NOVEMBER_WEEK1_DATA) {
    console.log(`▶ 渲染 ${d.dateFormatted} 圖卡...`);
    
    // 渲染 4:5 貼文版 (1200 x 1500)
    await page.setViewportSize({ width: 1200, height: 1500 });
    const postUrl = `file://${path.join(baseDir, 'november_card_renderer.html')}?day=${d.dayId}&mode=post`;
    await page.goto(postUrl, { waitUntil: 'networkidle' });
    const postImgPath = path.join(postOutDir, `${d.dayId}_生活手帳_貼文4x5.png`);
    await page.locator('#cardCanvas').screenshot({ path: postImgPath });

    // 渲染 9:16 限動版 (1080 x 1920)
    await page.setViewportSize({ width: 1080, height: 1920 });
    const storyUrl = `file://${path.join(baseDir, 'november_card_renderer.html')}?day=${d.dayId}&mode=story`;
    await page.goto(storyUrl, { waitUntil: 'networkidle' });
    const storyImgPath = path.join(storyOutDir, `${d.dayId}_生活手帳_限動9x16.png`);
    await page.locator('#cardCanvas').screenshot({ path: storyImgPath });

    // 產生音樂夾 Hero 封面 (從 4:5 圖卡複製過去當封面)
    const heroDst = path.join(baseDir, d.dayId, 'assets', 'hero.png');
    fs.copyFileSync(postImgPath, heroDst);
  }
  await browser.close();
  console.log('✅ 4:5 貼文圖卡 (7張)、9:16 限動圖卡 (7張) 與封面圖全部導出完畢！');

  // 3. 產出 11/1 ~ 11/7 FB 社群貼文文案（已預先綁定 GitHub Pages 網址）
  console.log('\n[3/4] 正在編譯 FB 社群專屬貼文文案（內含 GitHub 點播網址）...');
  let fbPostsMarkdown = `# 🍁 11 月份 FB 社群生日問候貼文（11/01 ～ 11/07 能量音樂夾實測版）\n\n`;

  NOVEMBER_WEEK1_DATA.forEach(d => {
    const liveMusicUrl = `https://sam692216.github.io/birthday-music/${d.dayId}/`;
    const postContent = `### 🍁 ${d.dateFormatted}｜ ${d.numberLabel}

\`\`\`markdown
🎂【${d.dateFormatted}壽星 ‧ 生日快樂】
✨ 靈數密碼：${d.numberLabel}

「${d.headline}」🍁

${d.reminder}

💬 今日靈數問候：
「${d.annualQuestion}」

🎧【今日壽星專屬・能量 DJ 點播站】
阿福教練今天特別為 ${d.dateFormatted} 的你準備了一份「能聽的生日手帳」！
點進專屬音樂夾，選一個你今天最想安放的心情，聽聽宇宙為你點播哪一首能量主題曲：
👉 專屬點播連結：${liveMusicUrl}
（💡 裡面還能一鍵複製今日專屬生日祝福發給重要的人喔！）

🎉 祝 ${d.dateFormatted} 的你生日快樂！
👉 聽完點播後，快來留言告訴教練：今天 DJ 幫你選中了哪一首歌？🎶

#${d.dateFormatted}生日快樂 #生命靈數 #流年${d.flow} #能量DJ點播站 #阿福教練
\`\`\`

---
`;
    fbPostsMarkdown += postContent;
  });

  fs.writeFileSync(path.join(baseDir, '11月份FB社群貼文_1101_1107.md'), fbPostsMarkdown, 'utf8');
  console.log('✅ FB 社群貼文已存檔至 11月份FB社群貼文_1101_1107.md！');

  // 4. 一鍵推送至 GitHub Pages
  console.log('\n[4/4] 正在將 1101 ~ 1107 網頁一鍵推送到 GitHub Pages...');
  try {
    execSync('git add .', { cwd: baseDir, stdio: 'inherit' });
    execSync('git commit -m "Auto-deploy 1101-1107 music folders and cards"', { cwd: baseDir, stdio: 'inherit' });
    execSync('git push origin master', { cwd: baseDir, stdio: 'inherit' });
    console.log('🎉 GitHub 推送成功！7 個專屬點播網頁正式全球上線！');
  } catch (gitErr) {
    console.log('Git 推送提醒：', gitErr.message);
  }

  console.log('\n====================================================');
  console.log('🎉 11/1 ~ 11/7 全套自動化流水線圓滿執行完成！');
  console.log('====================================================\n');
}

main().catch(console.error);
