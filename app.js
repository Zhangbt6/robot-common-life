// 硅基的我们？ v3 — small, dependency-free behaviours for the talk page.
const $ = id => document.getElementById(id);
const talkTitle = '硅基的我们？——从自主行动到社会共处';
const abstract = $('abstract').textContent.trim();
$('count').textContent = `简介 ${Array.from(abstract).length} 字（含标点）`;

// Copy the submitted title and abstract.
$('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(`分享主题：${talkTitle}\n\n内容简介：${abstract}`);
    $('copy-status').textContent = '已复制题目和简介。';
  } catch {
    $('copy-status').textContent = '浏览器没有允许复制，请手动选中上面的文字。';
  }
});

// Speaker notes stay in this browser only. The key is shared with the previous edition.
const NOTES_KEY = 'robot-common-life-notes';
try {
  $('notes').value = localStorage.getItem(NOTES_KEY) || '';
  $('save-status').textContent = '只保存在这台电脑的浏览器里';
} catch {
  $('save-status').textContent = '浏览器不能保存笔记，请记得导出';
}
$('notes').addEventListener('input', () => {
  try { localStorage.setItem(NOTES_KEY, $('notes').value); $('save-status').textContent = '已保存'; }
  catch { $('save-status').textContent = '保存失败，请导出笔记'; }
});
$('export').addEventListener('click', () => {
  const text = `${talkTitle}\n\n${abstract}\n\n备讲笔记\n${$('notes').value}`;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: '硅基的我们-备讲笔记.txt' });
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// Print with every speaker note open, then restore.
let openStates;
addEventListener('beforeprint', () => {
  openStates = [...document.querySelectorAll('details')].map(d => [d, d.open]);
  openStates.forEach(([d]) => { d.open = true; });
});
addEventListener('afterprint', () => { openStates?.forEach(([d, open]) => { d.open = open; }); openStates = null; });
$('print').addEventListener('click', () => print());

// Discussion: switch perspective.
const roles = {
  visitor: '它是否真的帮我把事办成了？我能不能看懂它在做什么，随时打断或纠正它？如果我走得慢、听不清，它还适合我吗？',
  bystander: '我没有用它，却可能被要求让路、被摄像头拍到。我的意见怎样才能进入设计？这份便利带来的打扰，由谁来承担？',
  staff: '整体服务是变好了，还是把难办的事转给了我？出了冲突谁来处理，怎样记录反馈、修改规则，并向受影响的人解释？'
};
document.querySelectorAll('[data-role]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-role]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  $('role-result').textContent = roles[button.dataset.role];
}));

// Reading position, active nav item and presentation stage label.
const stops = [
  ['home', '封面'], ['opening', '开场'], ['learn', '一 向人类学习'], ['society', '二 两道坎'],
  ['governance', '三 治理问题'], ['closing', '结尾'], ['discussion', '交流']
];
const navTargets = ['opening', 'learn', 'society', 'governance', 'closing', 'discussion', 'studio'];
let current = 0, queued = false;
function update() {
  queued = false;
  const line = (document.querySelector('.masthead').offsetHeight || 0) + 120;
  current = 0;
  stops.forEach(([id], i) => { if ($(id).getBoundingClientRect().top <= line) current = i; });
  let active = null;
  navTargets.forEach(id => { const el = $(id); if (el.offsetParent !== null && el.getBoundingClientRect().top <= line) active = id; });
  document.querySelectorAll('.masthead nav a').forEach(a => {
    if (a.hash === '#' + active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
  });
  const total = document.documentElement.scrollHeight - innerHeight;
  $('reading-progress').style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0})`;
  $('stage-label').textContent = stops[current][1];
  $('stage-prev').disabled = current === 0;
  $('stage-next').disabled = current === stops.length - 1;
}
const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule);
document.addEventListener('toggle', schedule, true);
addEventListener('load', update);
update();

// Presentation mode: one segment per screen, arrow keys to move, Esc to leave.
function jump(index) {
  current = Math.max(0, Math.min(stops.length - 1, index));
  $(stops[current][0]).scrollIntoView({ behavior: 'instant', block: 'start' });
  update();
}
function go(step) { update(); jump(current + step); }
function present(on) {
  update();
  const anchor = stops[current][0];
  document.body.classList.toggle('focus', on);
  $('present').setAttribute('aria-pressed', String(on));
  $('present').textContent = on ? '退出展示' : '展示模式';
  $('stage').hidden = !on;
  jump(stops.findIndex(([id]) => id === anchor));
}
$('present').addEventListener('click', () => present(!document.body.classList.contains('focus')));
$('stage-exit').addEventListener('click', () => { present(false); $('present').focus(); });
$('stage-prev').addEventListener('click', () => go(-1));
$('stage-next').addEventListener('click', () => go(1));
document.addEventListener('keydown', event => {
  if (!document.body.classList.contains('focus') || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest('input, textarea, select, video, iframe, [contenteditable]')) return;
  if (event.key === 'Escape') { present(false); $('present').focus(); }
  else if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); go(1); }
  else if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); go(-1); }
});

// External media: nothing autoplays, only one video plays at a time, failures point to the source.
document.querySelectorAll('video').forEach(video => {
  const status = video.closest('figure')?.querySelector('.media-status');
  const fail = () => { if (status) status.textContent = '视频暂时无法加载，可以通过说明里的链接去原站观看。'; };
  video.addEventListener('error', fail);
  video.querySelectorAll('source').forEach(s => s.addEventListener('error', fail));
  video.addEventListener('playing', () => {
    if (status) status.textContent = '';
    document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
  });
});
document.querySelectorAll('.load-video').forEach(button => button.addEventListener('click', () => {
  const box = button.closest('[data-youtube]');
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${box.dataset.youtube}?autoplay=1&rel=0`;
  frame.title = box.dataset.title || '研究演示视频';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  box.replaceChildren(frame);
  const status = box.closest('figure')?.querySelector('.media-status');
  if (status) status.textContent = '如果没有画面，可能是当前网络打不开 YouTube，请用说明里的链接。';
}));
document.querySelectorAll('img').forEach(img => {
  const fail = () => {
    if (img.dataset.failed) return;
    img.dataset.failed = 'true';
    img.classList.add('media-unavailable');
    const note = Object.assign(document.createElement('span'), { className: 'image-fallback', textContent: `图片暂时无法加载：${img.alt}。` });
    img.after(note);
  };
  img.addEventListener('error', fail);
  if (img.complete && !img.naturalWidth) fail();
});
