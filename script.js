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
      <div class="menu-top"><span class="menu-category">${menu.category.toUpperCase()}</span><button class="heart ${saved.includes(menu.name) ? 'saved' : ''}" data-save="${menu.name}" aria-label="${menu.name} 찜하기">${saved.includes(menu.name) ? '♥' : '♡'}</button></div>
      <div class="menu-art">${menu.emoji}</div>
      <div class="menu-bottom"><div><h3 class="menu-name">${menu.name}</h3><p class="menu-meta">${menu.meta}</p></div><span class="price">${menu.price}</span></div>
    </article>`).join('');
  document.querySelectorAll('[data-save]').forEach(button => button.addEventListener('click', () => toggleSave(button.dataset.save)));
  document.querySelector('#savedCount').textContent = saved.length;
}
function toggleSave(name) { saved = saved.includes(name) ? saved.filter(item => item !== name) : [...saved, name]; localStorage.setItem('savedMenus', JSON.stringify(saved)); render(); showToast(saved.includes(name) ? `${name}을(를) 찜했어요` : '찜 목록에서 삭제했어요'); }
function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1900); }
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => { document.querySelector('.tab.active').classList.remove('active'); tab.classList.add('active'); activeCategory = tab.dataset.category; render(); }));
searchInput.addEventListener('input', render);
document.querySelector('#randomBtn').addEventListener('click', () => { const available = menus.filter(menu => activeCategory === '전체' || menu.category === activeCategory); const pick = available[Math.floor(Math.random() * available.length)]; showToast(`오늘은 ${pick.name} 어때요? ${pick.emoji}`); const firstCard = document.querySelector('.menu-card'); if (firstCard) firstCard.scrollIntoView({behavior:'smooth', block:'center'}); });
document.querySelector('#savedBtn').addEventListener('click', () => { if (!saved.length) return showToast('아직 찜한 메뉴가 없어요'); searchInput.value = ''; activeCategory = '전체'; document.querySelector('.tab.active').classList.remove('active'); document.querySelector('[data-category="전체"]').classList.add('active'); render(); showToast(`찜한 메뉴 ${saved.length}개를 보여드려요`); document.querySelector('#menuGrid').scrollIntoView({behavior:'smooth'}); });
render();
