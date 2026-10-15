const titles = [
  { main: '我们在创造谁？', sub: '机器人的认知、成长与共处', reason: '首选：主标题承载哲学问题，副标题交代三幕故事。“成长”容纳学习与自我改进，不预设无限自主进化已经实现。' },
  { main: '我们在创造谁？', sub: '从世界模型、自我改进到人机共处', reason: '学术海报版：前沿方向更明确，但术语较多，适合希望在海报上直接展示技术内容的场合。' },
  { main: '机器人是一面镜子', sub: '在预测、成长与共处中重新认识人类', reason: '更温和、更易理解。演讲中需让镜子的比喻继续发展：机器会回应，也会改变映照它的人。' },
  { main: '硅基的我们？', sub: '机器人与人类经验的另一种延伸', reason: '辨识度高、思辨感强，但必须保留问号；“硅基”是技术意象，不能代指已经成立的新生命形式。' }
];
const abstract = '当机器人开始预测世界、从经历中学习、与人建立关系，我们在创造谁？分享结合世界模型、自我改进、社会具身研究与空中机器人实践，追问机器如何继承人的经验，又因不同的身体与经历走向差异，借此重新认识人类自己。';
const $ = id => document.getElementById(id);
let selected = 0;
$('abstract').textContent = abstract;
$('count').textContent = `简介 ${Array.from(abstract).length} 字（含标点）`;
titles.forEach((t, i) => {
  const button = document.createElement('button');
  button.className = 'title-option';
  const main = document.createElement('b');
  const sub = document.createElement('small');
  main.textContent = t.main;
  sub.textContent = t.sub;
  button.append(main, sub);
  button.addEventListener('click', () => select(i));
  $('titles').appendChild(button);
});
function select(i) {
  selected = i;
  document.querySelectorAll('.title-option').forEach((button, j) => {
    button.classList.toggle('selected', j === i);
    button.setAttribute('aria-pressed', String(j === i));
  });
  $('poster-title').textContent = `${titles[i].main}——${titles[i].sub}`;
  $('title-reason').textContent = titles[i].reason;
  $('copy-status').textContent = '';
}
select(0);
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
function poster() { return `分享主题：${titles[selected].main}——${titles[selected].sub}\n\n内容简介：${abstract}`; }
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
  link.download = '我们在创造谁-备讲笔记.txt';
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
$('present').addEventListener('click', () => {
  const active = document.body.classList.toggle('focus');
  $('present').textContent = active ? '退出专注' : '专注阅读';
  $('present').setAttribute('aria-pressed', String(active));
});
