// ========================================
// 자산관리 앱 - 임시 데이터
// 나중에 Supabase로 교체할 예정입니다.
// ========================================

let assets = [];
let debts = [];


// 숫자를 원화 형태로 표시
function formatMoney(amount) {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}


// 화면의 총액 업데이트
function updateSummary() {
  const totalAssets = assets.reduce((sum, asset) => {
    return sum + asset.amount;
  }, 0);

  const totalDebt = debts.reduce((sum, debt) => {
    return sum + debt.amount;
  }, 0);

  const netAssets = totalAssets - totalDebt;

  document.getElementById("total-assets").textContent =
    formatMoney(totalAssets);

  document.getElementById("total-debt").textContent =
    formatMoney(totalDebt);

  document.getElementById("net-assets").textContent =
    formatMoney(netAssets);
}


// 자산 목록 표시
function renderAssets() {
  const list = document.getElementById("asset-list");

  if (assets.length === 0) {
    list.innerHTML = `
      <div class="empty">
        등록된 자산이 없습니다.
      </div>
    `;
    return;
  }

  list.innerHTML = assets.map(asset => `
    <div class="asset-item">
      <span>${asset.name}</span>
      <strong>${formatMoney(asset.amount)}</strong>
    </div>
  `).join("");
}


// 부채 목록 표시
function renderDebts() {
  const list = document.getElementById("debt-list");

  if (debts.length === 0) {
    list.innerHTML = `
      <div class="empty">
        등록된 부채가 없습니다.
      </div>
    `;
    return;
  }

  list.innerHTML = debts.map(debt => `
    <div class="asset-item">
      <span>${debt.name}</span>
      <strong>${formatMoney(debt.amount)}</strong>
    </div>
  `).join("");
}


// 자산 추가
document.getElementById("add-asset-btn").addEventListener("click", () => {
  const name = prompt("자산 이름을 입력하세요.");

  if (!name) return;

  const amount = Number(
    prompt("금액을 입력하세요. 예: 10000000")
  );

  if (isNaN(amount)) {
    alert("숫자로 입력해주세요.");
    return;
  }

  assets.push({
    name: name,
    amount: amount
  });

  renderAssets();
  updateSummary();
});


// 부채 추가
document.getElementById("add-debt-btn").addEventListener("click", () => {
  const name = prompt("부채 이름을 입력하세요.");

  if (!name) return;

  const amount = Number(
    prompt("금액을 입력하세요. 예: 5000000")
  );

  if (isNaN(amount)) {
    alert("숫자로 입력해주세요.");
    return;
  }

  debts.push({
    name: name,
    amount: amount
  });

  renderDebts();
  updateSummary();
});


// 처음 실행
renderAssets();
renderDebts();
updateSummary();
