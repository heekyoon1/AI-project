const menus = [
  {name:'제육볶음', category:'한식', emoji:'🥘', meta:'매콤하게 · 밥도둑', price:'₩9,000'},
  {name:'돈카츠 정식', category:'일식', emoji:'🍱', meta:'바삭하게 · 든든하게', price:'₩11,000'},
  {name:'마라탕', category:'중식', emoji:'🍜', meta:'얼얼하게 · 취향대로', price:'₩10,000'},
  {name:'연어 포케', category:'가벼운 식사', emoji:'🥗', meta:'산뜻하게 · 건강하게', price:'₩12,500'},
  {name:'김치찌개', category:'한식', emoji:'🍲', meta:'따끈하게 · 익숙하게', price:'₩8,000'},
  {name:'초밥 세트', category:'일식', emoji:'🍣', meta:'깔끔하게 · 다양하게', price:'₩13,000'},
  {name:'탄탄면', category:'중식', emoji:'🍜', meta:'고소하게 · 진하게', price:'₩9,500'},
  {name:'치킨 샐러드', category:'가벼운 식사', emoji:'🥬', meta:'담백하게 · 든든하게', price:'₩10,500'},
];

let activeCategory = '전체';
let saved = JSON.parse(localStorage.getItem('savedMenus') || '[]');
let likeCounts = {};
let supabaseClient = null;
let currentUserId = null;
let databaseReady = false;

const grid = document.querySelector('#menuGrid');
const empty = document.querySelector('#emptyState');
const resultCount = document.querySelector('#resultCount');
const searchInput = document.querySelector('#searchInput');

function render() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = menus.filter(menu => (activeCategory === '전체' || menu.category === activeCategory) && (menu.name.toLowerCase().includes(term) || menu.category.toLowerCase().includes(term)));
  resultCount.textContent = filtered.length;
  empty.hidden = filtered.length > 0;
  grid.innerHTML = filtered.map(menu => `
    <article class="menu-card">
      <div class="menu-top">
        <span class="menu-category">${menu.category.toUpperCase()}</span>
        <div class="heart-wrap">
          <button class="heart ${saved.includes(menu.name) ? 'saved' : ''}" data-save="${menu.name}" aria-label="${menu.name} 저장하기">${saved.includes(menu.name) ? '♥' : '♡'}</button>
          <span class="like-count" aria-label="${menu.name} 저장 수">${likeCounts[menu.name] || 0}</span>
        </div>
      </div>
      <div class="menu-art">${menu.emoji}</div>
      <div class="menu-bottom"><div><h3 class="menu-name">${menu.name}</h3><p class="menu-meta">${menu.meta}</p></div><span class="price">${menu.price}</span></div>
    </article>`).join('');
  document.querySelectorAll('[data-save]').forEach(button => button.addEventListener('click', () => toggleSave(button.dataset.save, button)));
  document.querySelector('#savedCount').textContent = saved.length;
}

async function initDatabase() {
  const config = window.SUPABASE_CONFIG || {};
  if (!config.url || !config.anonKey || !window.supabase) {
    console.info('Supabase 환경변수가 없어 브라우저 임시 저장 모드로 실행합니다.');
    return;
  }

  try {
    supabaseClient = window.supabase.createClient(config.url, config.anonKey);
    const sessionResult = await supabaseClient.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;

    let session = sessionResult.data.session;
    if (!session) {
      const signInResult = await supabaseClient.auth.signInAnonymously();
      if (signInResult.error) throw signInResult.error;
      session = signInResult.data.session;
    }

    currentUserId = session.user.id;
    const savedResult = await supabaseClient.from('menu_likes').select('menu_name').eq('user_id', currentUserId);
    if (savedResult.error) throw savedResult.error;
    saved = savedResult.data.map(row => row.menu_name);
    localStorage.setItem('savedMenus', JSON.stringify(saved));

    await refreshLikeCounts();
    databaseReady = true;
    render();
  } catch (error) {
    console.error('Supabase 연결 오류:', error);
    showToast('저장 기능 연결을 확인해주세요');
  }
}

async function refreshLikeCounts() {
  const results = await Promise.all(menus.map(async menu => {
    const result = await supabaseClient.from('menu_likes').select('*', { count: 'exact', head: true }).eq('menu_name', menu.name);
    if (result.error) throw result.error;
    return [menu.name, result.count || 0];
  }));
  likeCounts = Object.fromEntries(results);
}

async function toggleSave(name, button) {
  const wasSaved = saved.includes(name);

  if (!databaseReady) {
    saved = wasSaved ? saved.filter(item => item !== name) : [...saved, name];
    localStorage.setItem('savedMenus', JSON.stringify(saved));
    render();
    showToast(`${name}을(를) 브라우저에 임시 저장했어요`);
    return;
  }

  button.disabled = true;
  try {
    const result = wasSaved
      ? await supabaseClient.from('menu_likes').delete().eq('menu_name', name).eq('user_id', currentUserId)
      : await supabaseClient.from('menu_likes').insert({ menu_name: name, user_id: currentUserId });
    if (result.error) throw result.error;

    saved = wasSaved ? saved.filter(item => item !== name) : [...saved, name];
    likeCounts[name] = Math.max(0, (likeCounts[name] || 0) + (wasSaved ? -1 : 1));
    localStorage.setItem('savedMenus', JSON.stringify(saved));
    render();
    showToast(wasSaved ? '저장을 취소했어요' : `${name}을(를) 저장했어요`);
  } catch (error) {
    console.error('메뉴 저장 오류:', error);
    button.disabled = false;
    showToast('저장하지 못했어요. 잠시 후 다시 시도해주세요');
  }
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelector('.tab.active').classList.remove('active');
  tab.classList.add('active');
  activeCategory = tab.dataset.category;
  render();
}));

searchInput.addEventListener('input', render);
document.querySelector('#randomBtn').addEventListener('click', () => {
  const available = menus.filter(menu => activeCategory === '전체' || menu.category === activeCategory);
  const pick = available[Math.floor(Math.random() * available.length)];
  showToast(`오늘은 ${pick.name} 어때요? ${pick.emoji}`);
  const firstCard = document.querySelector('.menu-card');
  if (firstCard) firstCard.scrollIntoView({behavior:'smooth', block:'center'});
});
document.querySelector('#savedBtn').addEventListener('click', () => {
  if (!saved.length) return showToast('아직 저장한 메뉴가 없어요');
  searchInput.value = '';
  activeCategory = '전체';
  document.querySelector('.tab.active').classList.remove('active');
  document.querySelector('[data-category="전체"]').classList.add('active');
  render();
  showToast(`저장한 메뉴는 ${saved.length}개예요`);
  document.querySelector('#menuGrid').scrollIntoView({behavior:'smooth'});
});

render();
initDatabase();
