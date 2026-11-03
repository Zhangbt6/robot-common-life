const talkTitle = '硅基的我们？——从自主行动到社会共处';
const abstract = '本次分享从自主机器人的研究实践出发，结合前沿进展，探讨机器人如何理解世界、积累经验并自主行动。围绕社会具身智能，讨论机器人走进日常生活、参与社会互动所带来的开放议题，在技术与社会的交汇处思考人机共处。';
const $ = id => document.getElementById(id);
$('abstract').textContent = abstract;
$('hero-abstract').textContent = abstract;
$('poster-title').textContent = talkTitle;
$('count').textContent = `简介 ${Array.from(abstract).length} 字（含标点）`;
const drawerCases = {
  compute: '更多计算可以比较可能性，却不能凭空补出缺失的事实。此时应保留多种假设。',
  observe: '获得相应授权并确保安全后，打开抽屉或使用合适的传感器，可能得到能区分假设的新信息。预测开始接受现实检验。',
  ask: '询问知道情况的人，也能带来新信息；但回答仍有可靠性与时效问题。智能不仅要会算，也要选择怎样获取证据。'
};
const socialCases = {
  automatic: '熟悉、低风险且已有明确约定的动作，自动完成可能减少负担。但习惯不等于永久授权；预测准确也不能消除拒绝的权利。',
  confirm: '询问能澄清意愿，却也可能不断增加负担。研究问题是何时值得问、问谁、怎样问，而不是让所有动作都停在确认框前。',
  agreement: '事先协商行动范围，提供可理解的预告和中止方式，并允许更新偏好。仍需研究谁有资格约定，以及出现多人分歧时如何处理。'
};
function bindChoices(attribute, cases, output) {
  document.querySelectorAll(`[${attribute}]`).forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll(`[${attribute}]`).forEach(other => {
      other.classList.toggle('active', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    });
    $(output).textContent = cases[button.getAttribute(attribute)];
  }));
}
bindChoices('data-drawer', drawerCases, 'drawer-result');
bindChoices('data-social', socialCases, 'social-result');
const publicCases = {
  visitor: '对使用者：它是否真的帮我完成了事情？我能否看懂、打断或纠正它？如果我走得慢、听不清，服务是否仍然适合我？',
  bystander: '对旁观者：我没有使用机器人，却可能被要求让路、被记录，或被迫配合。我的意见怎样进入设计？谁来承担便利背后的打扰？',
  staff: '对工作人员：整体服务是否改善，还是把困难转交给了人？遇到冲突谁来处理，如何记录反馈、调整规则，并向受影响的人解释？'
};
bindChoices('data-public', publicCases, 'public-result');
function poster() { return `分享主题：${talkTitle}\n\n内容简介：${abstract}`; }
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(poster()); $('copy-status').textContent = '已复制，可直接提交给活动老师。'; }
  catch { $('copy-status').textContent = '浏览器未允许自动复制，请选择上方文案手动复制。'; }
});
try {
  $('notes').value = localStorage.getItem('robot-common-life-notes') || '';
  $('save-status').textContent = '仅保存在当前浏览器';
} catch { $('save-status').textContent = '浏览器存储不可用，请及时导出'; }
$('notes').addEventListener('input', () => {
  try { localStorage.setItem('robot-common-life-notes', $('notes').value); $('save-status').textContent = '已保存到当前浏览器'; }
  catch { $('save-status').textContent = '保存失败，请导出笔记'; }
});
$('export').addEventListener('click', () => {
  const blob = new Blob([poster() + '\n\n备讲笔记\n' + $('notes').value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '硅基的我们-备讲笔记.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
let printStates;
window.addEventListener('beforeprint', () => {
  if (printStates) return;
  printStates = [...document.querySelectorAll('details')].map(item => [item, item.open]);
  printStates.forEach(([item]) => item.open = true);
});
window.addEventListener('afterprint', () => {
  if (printStates) printStates.forEach(([item, open]) => item.open = open);
  printStates = undefined;
});
$('print').addEventListener('click', () => window.print());
// Keep the reading position visible, including while navigating in presentation mode.
const chapters = [
  ['home', '封面'], ['prologue', '01 / 自主行动'], ['prediction', '02 / 预测与边界'],
  ['growth', '03 / 探索与成长'], ['embodiment', '04 / 身体与互动'],
  ['social', '05 / 社会共处'], ['return', '06 / 回望我们']
];
let currentChapter = 0;
let scheduled = false;
function updateReading() {
  scheduled = false;
  const marker = document.querySelector('header').getBoundingClientRect().height + 100;
  currentChapter = 0;
  chapters.forEach(([id], index) => {
    if ($(id).getBoundingClientRect().top <= marker) currentChapter = index;
  });
  const isStudio = !document.body.classList.contains('focus') && $('studio').getBoundingClientRect().top <= marker;
  const activeId = isStudio ? 'studio' : chapters[currentChapter][0];
  document.querySelectorAll('header nav a').forEach(link => {
    if (link.hash === '#' + activeId) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  const total = document.documentElement.scrollHeight - innerHeight;
  $('reading-progress').style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0})`;
  $('stage-label').textContent = chapters[currentChapter][1];
  $('stage-prev').disabled = currentChapter === 0;
  $('stage-next').disabled = currentChapter === chapters.length - 1;
}
function scheduleReading() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); }
}
function goChapter(direction) {
  updateReading();
  const next = Math.max(0, Math.min(chapters.length - 1, currentChapter + direction));
  $(chapters[next][0]).scrollIntoView({ behavior: 'instant', block: 'start' });
  updateReading();
}
function setPresentation(active) {
  updateReading();
  const anchorId = chapters[currentChapter][0];
  document.body.classList.toggle('focus', active);
  $('present').textContent = active ? '退出展示' : '展示模式';
  $('present').setAttribute('aria-pressed', String(active));
  $('stage-controls').hidden = !active;
  if (active) $(anchorId).scrollIntoView({ behavior: 'instant', block: 'start' });
  updateReading();
}
$('present').addEventListener('click', () => setPresentation(!document.body.classList.contains('focus')));
$('stage-prev').addEventListener('click', () => goChapter(-1));
$('stage-next').addEventListener('click', () => goChapter(1));
document.addEventListener('keydown', event => {
  if (!document.body.classList.contains('focus') || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, video, iframe, summary, [contenteditable]')) return;
  if (event.key === 'Escape') { setPresentation(false); $('present').focus(); }
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    goChapter(event.key === 'ArrowRight' ? 1 : -1);
  }
});
addEventListener('scroll', scheduleReading, { passive: true });
addEventListener('resize', scheduleReading);
document.addEventListener('toggle', scheduleReading, true);
addEventListener('load', updateReading);
updateReading();

// Keep external media optional, attributed and under the reader's control.
document.querySelectorAll('video').forEach(video => {
  const status = video.closest('figure').querySelector('.media-status');
  const failure = () => { status.textContent = '视频暂时无法加载，可通过上方出处链接查看原站。'; };
  video.addEventListener('error', failure);
  video.querySelectorAll('source').forEach(source => source.addEventListener('error', failure));
  video.addEventListener('playing', () => {
    status.textContent = '';
    document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
  });
});
document.querySelectorAll('.load-video').forEach(button => button.addEventListener('click', () => {
  const container = button.closest('.video-embed');
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${container.dataset.youtube}?autoplay=1&rel=0`;
  frame.title = 'Emo 人机表情互动：Columbia Engineering 官方演示';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  container.replaceChildren(frame);
}));
document.querySelectorAll('img').forEach(img => {
  const failure = () => {
    if (img.dataset.failed) return;
    img.dataset.failed = 'true';
    img.classList.add('media-unavailable');
    const notice = document.createElement('span');
    notice.className = 'image-fallback';
    notice.textContent = '图像暂时无法加载 · ' + img.alt + '。可通过出处链接查看原图。';
    img.insertAdjacentElement('afterend', notice);
  };
  img.addEventListener('error', failure);
  if (img.complete && !img.naturalWidth) failure();
});
