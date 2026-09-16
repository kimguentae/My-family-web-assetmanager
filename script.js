```javascript
// ========================================
// Supabase 설정
// ========================================

const SUPABASE_URL = "https://ozejxesdcuyypkrxamnd.supabase.co";

// 현재 사용 중인 Supabase anon key를 여기에 넣어주세요.
// 기존에 사용하던 키를 그대로 사용하면 됩니다.
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZWp4ZXNkY3V5eXBrcnhhbW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjE3MjksImV4cCI6MjEwNTEzNzcyOX0.Fcxd4ScWmJn7ZmfSmFyrNOX0MvXoZBSDn52uLV8R3GQ";

const ASSETS_API = `${SUPABASE_URL}/rest/v1/assets`;
const LIABILITIES_API = `${SUPABASE_URL}/rest/v1/liabilities`;


// ========================================
// 공통 헤더
// ========================================

function getHeaders() {
  return {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
}


// ========================================
// 페이지 시작
// ========================================

document.addEventListener("DOMContentLoaded", function () {

  console.log("자산관리 앱 시작");

  const assetButton = document.getElementById("add-asset-btn");
  const debtButton = document.getElementById("add-debt-btn");

  if (!assetButton) {
    console.error("add-asset-btn을 찾을 수 없습니다.");
  }

  if (!debtButton) {
    console.error("add-debt-btn을 찾을 수 없습니다.");
  }

  if (assetButton) {
    assetButton.addEventListener("click", function () {
      console.log("자산 추가 버튼 클릭");
      addItem("asset");
    });
  }

  if (debtButton) {
    debtButton.addEventListener("click", function () {
      console.log("부채 추가 버튼 클릭");
      addItem("debt");
    });
  }

  loadData();
});


// ========================================
// 데이터 불러오기
// ========================================

async function loadData() {

  console.log("Supabase 데이터 불러오는 중...");

  try {

    const assetsResponse = await fetch(
      `${ASSETS_API}?select=*&order=created_at.asc`,
      {
        method: "GET",
        headers: getHeaders()
      }
    );

    console.log("자산 API 상태:", assetsResponse.status);

    if (!assetsResponse.ok) {
      const errorText = await assetsResponse.text();
      console.error("자산 API 오류:", errorText);
      throw new Error(errorText);
    }

    const liabilitiesResponse = await fetch(
      `${LIABILITIES_API}?select=*&order=created_at.asc`,
      {
        method: "GET",
        headers: getHeaders()
      }
    );

    console.log("부채 API 상태:", liabilitiesResponse.status);

    if (!liabilitiesResponse.ok) {
      const errorText = await liabilitiesResponse.text();
      console.error("부채 API 오류:", errorText);
      throw new Error(errorText);
    }

    const assets = await assetsResponse.json();
    const liabilities = await liabilitiesResponse.json();

    console.log("불러온 자산:", assets);
    console.log("불러온 부채:", liabilities);

    renderAssets(assets);
    renderLiabilities(liabilities);
    updateSummary(assets, liabilities);

  } catch (error) {

    console.error("데이터 불러오기 실패:", error);

    alert(
      "Supabase에서 데이터를 불러오지 못했습니다.\n\n" +
      "Supabase URL 또는 API Key를 확인해주세요."
    );
  }
}


// ========================================
// 자산 출력
// ========================================

function renderAssets(assets) {

  const list = document.getElementById("asset-list");

  if (!list) {
    console.error("asset-list를 찾을 수 없습니다.");
    return;
  }

  if (!assets || assets.length === 0) {

    list.innerHTML = `
      <div class="empty">
        등록된 자산이 없습니다.
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  assets.forEach(function (asset) {

    const item = document.createElement("div");

    item.className = "asset-item";

    item.innerHTML = `
      <div class="asset-info">

        <div class="asset-name">
          ${escapeHtml(asset.name)}
        </div>

        <div class="asset-category">
          ${escapeHtml(asset.category || "")}
        </div>

      </div>

      <div class="asset-right">

        <strong>
          ${formatMoney(asset.amount)}
        </strong>

        <button
          class="delete-btn"
          onclick="deleteItem('asset', ${asset.id})"
        >
          삭제
        </button>

      </div>
    `;

    list.appendChild(item);

  });
}


// ========================================
// 부채 출력
// ========================================

function renderLiabilities(liabilities) {

  const list = document.getElementById("debt-list");

  if (!list) {
    console.error("debt-list를 찾을 수 없습니다.");
    return;
  }

  if (!liabilities || liabilities.length === 0) {

    list.innerHTML = `
      <div class="empty">
        등록된 부채가 없습니다.
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  liabilities.forEach(function (debt) {

    const item = document.createElement("div");

    item.className = "asset-item";

    item.innerHTML = `
      <div class="asset-info">

        <div class="asset-name">
          ${escapeHtml(debt.name)}
        </div>

        <div class="asset-category">
          ${escapeHtml(debt.category || "")}
        </div>

      </div>

      <div class="asset-right">

        <strong>
          ${formatMoney(debt.amount)}
        </strong>

        <button
          class="delete-btn"
          onclick="deleteItem('debt', ${debt.id})"
        >
          삭제
        </button>

      </div>
    `;

    list.appendChild(item);

  });
}


// ========================================
// 총액 계산
// ========================================

function updateSummary(assets, liabilities) {

  const totalAssets = assets.reduce(function (sum, item) {

    return sum + Number(item.amount || 0);

  }, 0);


  const totalDebt = liabilities.reduce(function (sum, item) {

    return sum + Number(item.amount || 0);

  }, 0);


  const netAssets = totalAssets - totalDebt;


  document.getElementById("total-assets").textContent =
    formatMoney(totalAssets);

  document.getElementById("total-debt").textContent =
    formatMoney(totalDebt);

  document.getElementById("net-assets").textContent =
    formatMoney(netAssets);
}


// ========================================
// 자산 / 부채 추가
// ========================================

async function addItem(type) {

  console.log("addItem 실행:", type);

  const isAsset = type === "asset";


  // 이름
  const name = prompt(
    isAsset
      ? "자산 이름을 입력하세요.\n예: 우리집 아파트"
      : "부채 이름을 입력하세요.\n예: 주택담보대출"
  );


  if (name === null) {
    return;
  }


  const trimmedName = name.trim();


  if (!trimmedName) {

    alert("이름을 입력해주세요.");

    return;
  }


  // 종류
  const category = prompt(
    isAsset
      ? "자산 종류를 입력하세요.\n예: 부동산 / 주식 / 예금 / 현금 / 기타"
      : "부채 종류를 입력하세요.\n예: 주택담보대출 / 신용대출 / 기타"
  );


  if (category === null) {
    return;
  }


  const trimmedCategory = category.trim();


  // 금액
  const amountText = prompt(
    isAsset
      ? "자산 금액을 입력하세요.\n예: 2000000000"
      : "부채 금액을 입력하세요.\n예: 130000000"
  );


  if (amountText === null) {
    return;
  }


  const amount = Number(
    amountText
      .replace(/,/g, "")
      .replace(/원/g, "")
      .trim()
  );


  if (!Number.isFinite(amount) || amount < 0) {

    alert("올바른 금액을 입력해주세요.");

    return;
  }


  const data = {
    name: trimmedName,
    category: trimmedCategory,
    amount: amount
  };


  console.log("Supabase에 저장할 데이터:", data);


  try {

    const url = isAsset
      ? ASSETS_API
      : LIABILITIES_API;


    const response = await fetch(url, {

      method: "POST",

      headers: getHeaders(),

      body: JSON.stringify(data)

    });


    console.log("등록 API 상태:", response.status);


    if (!response.ok) {

      const errorText = await response.text();

      console.error("Supabase 등록 오류:", errorText);

      throw new Error(errorText);
    }


    const result = await response.json();

    console.log("등록 성공:", result);


    await loadData();


    alert(
      isAsset
        ? "자산이 등록되었습니다."
        : "부채가 등록되었습니다."
    );


  } catch (error) {

    console.error("등록 실패:", error);

    alert(
      "등록하지 못했습니다.\n\n" +
      error.message
    );
  }
}


// ========================================
// 삭제
// ========================================

async function deleteItem(type, id) {

  const isAsset = type === "asset";


  const message = isAsset
    ? "이 자산을 삭제하시겠습니까?"
    : "이 부채를 삭제하시겠습니까?";


  if (!confirm(message)) {
    return;
  }


  try {

    const url = isAsset
      ? `${ASSETS_API}?id=eq.${id}`
      : `${LIABILITIES_API}?id=eq.${id}`;


    const response = await fetch(url, {

      method: "DELETE",

      headers: getHeaders()

    });


    if (!response.ok) {

      const errorText = await response.text();

      console.error("삭제 오류:", errorText);

      throw new Error(errorText);
    }


    await loadData();


  } catch (error) {

    console.error("삭제 실패:", error);

    alert(
      "삭제하지 못했습니다.\n\n" +
      error.message
    );
  }
}


// ========================================
// 금액 표시
// ========================================

function formatMoney(amount) {

  const number = Number(amount || 0);

  return number.toLocaleString("ko-KR") + "원";
}


// ========================================
// HTML 특수문자 처리
// ========================================

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```
