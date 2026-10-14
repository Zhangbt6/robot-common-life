const titles=[
 {main:'学会行动，如何共处？',sub:'从机器自主到人机共同生活',reason:'首选：用一个尚待共同回答的问题，把研究者与听众放在同一张讨论桌上；副标题交代技术起点与社会落点。'},
 {main:'自主之间',sub:'机器人行动与人的共同生活',reason:'更凝练、更有哲学意味。“自主”同时指向机器的执行能力与人的选择，需要副标题帮助海报读者理解。'},
 {main:'当智能走入生活',sub:'从具身行动到人机共处',reason:'最易理解，面向跨学科听众较友好；叙事温和，但标题的辨识度略低。'},
 {main:'行动的边界，共处的可能',sub:'一位机器人研究者的社会追问',reason:'更强调思想性与研究者立场，适合希望突出跨学科对话的活动。'},
 {main:'从机器自主到社会智能',sub:'机器人如何学会与人共处',reason:'最接近最初构想，学术方向明确；但容易被理解为已经实现的技术进阶，需要在简介中明确它是研究追问。'}
];
const abstract='机器人学会行动之后，如何与人共同生活？分享从空中操作、人机协作与仿真学习的研究出发，讨论机器自主与人的选择、行动能力与社会边界，追问信任、关怀和责任如何进入设计，探索从完成任务走向合宜行动的研究可能。';
let selected=0;
const $=id=>document.getElementById(id);
$('abstract').textContent=abstract;
$('count').textContent=`简介 ${Array.from(abstract).length} 字（含标点，不含空格）`;
titles.forEach((t,i)=>{const b=document.createElement('button');b.className='title-option';b.innerHTML=`<b>${t.main}</b><small>${t.sub}</small>`;b.addEventListener('click',()=>select(i));$('titles').appendChild(b)});
function select(i){selected=i;document.querySelectorAll('.title-option').forEach((b,j)=>{b.classList.toggle('selected',j===i);b.setAttribute('aria-pressed',String(j===i))});$('poster-title').textContent=`${titles[i].main}——${titles[i].sub}`;$('title-reason').textContent=titles[i].reason;$('copy-status').textContent=''}select(0);
const cases={clear:['情境 A','“请打开我桌子左侧的抽屉。”','在任务、授权与安全条件均清楚时执行；让在场的人看懂它准备做什么，并保留中止的机会。'],vague:['情境 B','“帮我把那个抽屉打开。”','先确认“哪个抽屉”以及是否具有相应授权。更快地执行一个含糊指令，可能只是更快地犯错。'],conflict:['情境 C','“打开它。”——“不要动，那是我的。”','暂停动作，澄清物品归属与授权关系；必要时交还人类协调。听见更多声音，并不意味着机器可以自行裁决所有分歧。']};
document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-case]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});const c=cases[b.dataset.case];$('case-label').textContent=c[0];$('case-title').textContent=c[1];$('case-text').textContent=c[2]}));
function poster(){return `分享主题：${titles[selected].main}——${titles[selected].sub}\n\n内容简介：${abstract}`}
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(poster());$('copy-status').textContent='已复制，可直接发给活动老师。'}catch{$('copy-status').textContent='浏览器未允许自动复制，请选择上方文案手动复制。'}});
try{$('notes').value=localStorage.getItem('robot-common-life-notes')||'';$('save-status').textContent='仅保存在当前浏览器'}catch{$('save-status').textContent='浏览器存储不可用，请及时导出'}
$('notes').addEventListener('input',()=>{try{localStorage.setItem('robot-common-life-notes',$('notes').value);$('save-status').textContent='已保存到当前浏览器'}catch{$('save-status').textContent='保存失败，请导出笔记'}});
$('export').addEventListener('click',()=>{const blob=new Blob([poster()+'\n\n备讲笔记\n'+$('notes').value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='行动与共处-备讲笔记.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)});
$('print').addEventListener('click',()=>{const items=[...document.querySelectorAll('details')];const states=items.map(d=>d.open);items.forEach(d=>d.open=true);window.addEventListener('afterprint',()=>items.forEach((d,i)=>d.open=states[i]),{once:true});window.print()});
$('present').addEventListener('click',()=>{const active=document.body.classList.toggle('focus');$('present').textContent=active?'退出专注':'专注阅读';$('present').setAttribute('aria-pressed',String(active))});
