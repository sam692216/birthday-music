(() => {
  "use strict";
  const d = window.CARD_DATA;
  if (!d) return;
  const byId = (id) => document.getElementById(id);
  const text = (id, value) => { const el = byId(id); if (el) el.textContent = value; };
  document.title = d.title + "｜生日快樂・生命靈數能量 DJ";
  document.querySelector('meta[name="description"]')?.setAttribute("content", d.title + "｜生日專屬能量祝福與歌曲點播。");
  byId("hero-image").alt = d.imageAlt;
  text("date-eyebrow", d.dateEyebrow);
  text("number-label", d.numberLabel);
  text("hero-title", d.headline);
  text("birthday-keywords", "生日數｜" + d.birthdayKeywords);
  text("flow-keywords", "流年 " + d.flow + "｜" + d.flowKeywords);
  text("board-quote", d.boardQuote);
  text("signature", d.signature);
  text("flow-number", String(d.flow));
  text("annual-reminder", d.reminder);
  text("annual-question", d.annualQuestion);
  text("footer-wish", d.wish);
  text("footer-signature", d.signature);

  const scenarioList = byId("scenario-list");
  const trackList = byId("track-list");
  let active = 0;
  let toastTimer;
  function showToast(message) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }
  function shareCopy(s) {
    return d.shareLead + "\n\n" + d.wish + "\n\n" + s.question + "\n" + d.hashtags;
  }
  function fallbackCopy(value) {
    const box = byId("copy-fallback");
    box.value = value;
    box.focus();
    box.select();
    try { return document.execCommand("copy"); } catch (_) { return false; }
  }
  async function copyText(value) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        showToast("祝福已複製，可以貼到 LINE 或 Facebook 分享！");
      } else if (fallbackCopy(value)) {
        showToast("祝福已複製，可以貼到 LINE 或 Facebook 分享！");
      } else {
        showToast("瀏覽器未允許複製，請選取祝福文字後手動複製。");
      }
    } catch (_) {
      if (!fallbackCopy(value)) showToast("複製未成功，請稍後再試。");
      else showToast("祝福已複製，可以貼到 LINE 或 Facebook 分享！");
    }
  }
  function selectScenario(index, moveFocus) {
    active = index;
    const s = d.scenarios[index];
    [...scenarioList.querySelectorAll("button")].forEach((button, i) => {
      button.setAttribute("aria-pressed", String(i === index));
    });
    text("greeting", "「" + s.question + "」");
    text("guide", s.guide);
    text("action-line", "今日小行動｜" + s.action);
    text("song-context", s.name + "・" + s.desc);
    text("song-title", "〈" + s.song + "〉");
    text("song-artist", s.artist);
    text("song-reason", s.reason);
    const link = byId("play-link");
    link.href = s.url;
    link.setAttribute("aria-label", "以 YouTube 搜尋 " + s.song + " " + s.artist);
    byId("copy-button").onclick = () => copyText(shareCopy(s));
    if (moveFocus) byId("greeting").scrollIntoView({behavior: "smooth", block: "nearest"});
  }
  d.scenarios.forEach((s, i) => {
    const button = document.createElement("button");
    button.className = "scenario-button";
    button.type = "button";
    button.dataset.mode = s.id;
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = '<span class="scenario-title"></span><span class="scenario-desc"></span>';
    button.querySelector(".scenario-title").textContent = s.icon + " " + s.name;
    button.querySelector(".scenario-desc").textContent = s.desc;
    button.addEventListener("click", () => selectScenario(i, false));
    scenarioList.append(button);
  });
  d.tracks.forEach((track, i) => {
    const a = document.createElement("a");
    a.className = "track-card";
    a.href = track.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", "以 YouTube 搜尋 " + track.song + " " + track.artist);
    const num = document.createElement("span"); num.className = "track-number"; num.textContent = String(i + 1);
    const copy = document.createElement("span"); copy.className = "track-copy";
    const name = document.createElement("span"); name.className = "track-name"; name.textContent = track.song + "｜" + track.artist;
    const meta = document.createElement("span"); meta.className = "track-meta"; meta.textContent = track.note;
    copy.append(name, meta);
    const arrow = document.createElement("span"); arrow.className = "track-arrow"; arrow.setAttribute("aria-hidden","true"); arrow.textContent = "↗";
    a.append(num, copy, arrow); trackList.append(a);
  });
  byId("share-button").addEventListener("click", () => copyText(shareCopy(d.scenarios[active])));
  selectScenario(0, false);
})();
