/* ==================================================
   MY ASSET
================================================== */


/* ==================================================
   SUPABASE 설정
================================================== */

const SUPABASE_URL = "https://ozejxesdcuyypkrxamnd.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZWp4ZXNkY3V5eXBrcnhhbW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjE3MjksImV4cCI6MjEwNTEzNzcyOX0.Fcxd4ScWmJn7ZmfSmFyrNOX0MvXoZBSDn52uLV8R3GQ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* ==================================================
   기본 항목
================================================== */

const DEFAULT_TREE = [
    {
        id: "asset_realestate",
        name: "부동산",
        type: "asset",
        children: [
            { id: "apt", name: "아파트", children: [] }
        ]
    },
    {
        id: "asset_investment",
        name: "투자자산",
        type: "asset",
        children: [
            { id: "koreaStock", name: "국내주식", children: [] },
            { id: "usStock", name: "미국주식", currency: "USD", children: [] },
            { id: "coin", name: "코인", children: [] }
        ]
    },
    {
        id: "asset_cash",
        name: "현금성자산",
        type: "asset",
        children: [
            { id: "shinhanCash", name: "신한은행", children: [] },
            { id: "krBroker", name: "증권계좌(₩)", children: [] },
            { id: "usBroker", name: "증권계좌($)", currency: "USD", children: [] },
            { id: "momCard", name: "엄마카드", children: [] }
        ]
    },
    {
        id: "asset_cashgift",
        name: "현금 및 상품권",
        type: "asset",
        children: [
            { id: "cashMoney", name: "현금", children: [] },
            { id: "giftCard", name: "상품권", children: [] }
        ]
    },
    {
        id: "asset_etc",
        name: "기타자산",
        type: "asset",
        children: [
            { id: "retirementGeuntae", name: "퇴직공제금(근태)", children: [] },
            { id: "retirementMiran", name: "퇴직공제금(미란)", children: [] }
        ]
    },
    {
        id: "debt_mortgage",
        name: "주택담보대출",
        type: "debt",
        children: [
            { id: "mortgageShinhan", name: "신한은행", children: [] }
        ]
    },
    {
        id: "debt_credit",
        name: "신용대출",
        type: "debt",
        children: [
            { id: "mgLoan", name: "새마을금고", children: [] },
            { id: "shinhanLoan", name: "신한은행", children: [] },
            { id: "kbLoan", name: "국민은행", children: [] }
        ]
    }
];


/* ==================================================
   분석 섹션 정의
================================================== */

const ANALYSIS_SECTIONS = [
    { id: "metricCards",      name: "핵심 지표 카드",           defaultOn: true },
    { id: "netWorthChart",    name: "순자산 추이",              defaultOn: true },
    { id: "assetDebtChart",   name: "자산 · 부채 추이",         defaultOn: true },
    { id: "donutAsset",       name: "자산 구성 도넛",           defaultOn: true },
    { id: "debtRepayChart",   name: "부채 상환 추이",           defaultOn: true },
    { id: "monthlyIncrease",  name: "월별 순자산 증가액",       defaultOn: true },
    { id: "investmentChart",  name: "투자자산 변동",            defaultOn: true },
    { id: "contribution",     name: "자산 증가 기여도",         defaultOn: true },
    { id: "allocation",       name: "자산배분 비중 추이",       defaultOn: true },
    { id: "goalProgress",     name: "목표 진행률",              defaultOn: true },
    { id: "monthlySummary",   name: "이번 달 요약 리포트",      defaultOn: true }
];


/* ==================================================
   상태
================================================== */

let tree = loadTree();

let selectedDate =
    localStorage.getItem("myAssetSelectedDate") || getToday();

let analysisConfig = loadAnalysisConfig();

let analysisHistory = [];
let analysisLoaded = false;

let goals = loadGoals();


/* ==================================================
   시작
================================================== */

document.addEventListener("DOMContentLoaded", async function () {

    normalizeTree();

    updateDate();

    initNavigation();

    initDate();

    initSave();

    initNetWorthStack();

    initHomeGroups();

    initGlobalSwipeReset();

    initSettings();

    renderInput();

    await loadDateData();

});


/* ==================================================
   날짜
================================================== */

function getToday() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}


function formatDate(date) {
    if (!date) return "";
    return date.replaceAll("-", ".");
}


function updateDate() {
    const element = document.getElementById("selectedDate");
    if (element) element.textContent = formatDate(selectedDate);
}


function initDate() {
    const picker = document.getElementById("datePicker");
    if (!picker) return;

    picker.value = selectedDate;

    picker.addEventListener("change", async function () {
        if (!this.value) return;

        selectedDate = this.value;
        localStorage.setItem("myAssetSelectedDate", selectedDate);

        updateDate();
        renderInput();

        await loadDateData();
    });
}


/* ==================================================
   네비게이션
================================================== */

function initNavigation() {
    document.querySelectorAll(".nav-item").forEach(function (button) {
        button.addEventListener("click", function () {

            closeAllSwipes();

            const page = this.dataset.page;

            document.querySelectorAll(".page")
                .forEach(p => p.classList.remove("active-page"));

            const target = document.getElementById(page + "Page");
            if (target) target.classList.add("active-page");

            document.querySelectorAll(".nav-item")
                .forEach(n => n.classList.remove("active"));

            this.classList.add("active");

            const title = document.getElementById("headerTitle");
            if (title) {
                title.textContent =
                    page === "input" ? "자산입력"
                    : page === "settings" ? "설정"
                    : "MY ASSET";
            }

            if (page === "analysis") renderAnalysis();
            if (page === "settings") renderSettings();

        });
    });
}


/* ==================================================
   홈 순자산 카드 스택
================================================== */

function initNetWorthStack() {
    const stack = document.getElementById("netWorthStack");
    const dots = document.getElementById("stackDots");
    if (!stack) return;

    stack.addEventListener("scroll", function () {
        if (!dots) return;
        const index = Math.round(stack.scrollLeft / stack.clientWidth);
        dots.querySelectorAll(".dot").forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });
    });

    if (dots) {
        dots.querySelectorAll(".dot").forEach((dot, i) => {
            dot.addEventListener("click", function () {
                stack.scrollTo({
                    left: stack.clientWidth * i,
                    behavior: "smooth"
                });
            });
        });
    }
}


/* ==================================================
   홈 그룹 토글
================================================== */

function initHomeGroups() {
    document.querySelectorAll(".home-group-header").forEach(header => {
        header.addEventListener("click", function () {
            const group = header.closest(".home-group");
            if (!group) return;

            const body = group.querySelector(".home-group-body");
            if (!body) return;

            header.classList.toggle("open");
            body.classList.toggle("open");
        });
    });
}


/* ==================================================
   전역 스와이프 리셋
================================================== */

function initGlobalSwipeReset() {
    document.addEventListener("touchstart", function (e) {
        if (!e.target.closest(".swipe-content.swiped")) {
            closeAllSwipes();
        }
    }, { passive: true });

    document.addEventListener("mousedown", function (e) {
        if (!e.target.closest(".swipe-content.swiped")) {
            closeAllSwipes();
        }
    });
}


/* ==================================================
   저장
================================================== */

function initSave() {
    const button = document.getElementById("saveButton");
    if (!button) return;
    button.addEventListener("click", saveAll);
}


async function saveAll() {
    const button = document.getElementById("saveButton");
    const status = document.getElementById("saveStatus");
    if (!button) return;

    closeAllSwipes();

    button.disabled = true;
    button.textContent = "저장 중...";

    if (status) status.textContent = "";

    try {
        const values = collectValues();

        // 로컬 fallback
        localStorage.setItem(
            "myAssetValues_" + selectedDate,
            JSON.stringify(values)
        );

        saveTree();
        updateHome();

        const data = {
            baseDate: selectedDate,
            values: values,
            tree: tree
        };

        const result = await saveToSupabase(data);

        if (result && result.success) {
            if (status) status.textContent = "저장되었습니다.";
        } else {
            if (status) status.textContent = "저장에 실패했습니다.";
            console.error("Save failed:", result);
        }
    } catch (e) {
        console.error("Save exception:", e);
        if (status) status.textContent = "저장에 실패했습니다.";
    } finally {
        button.disabled = false;
        button.textContent = "저장하기";
    }
}


/* ==================================================
   SUPABASE FUNCTIONS
================================================== */

async function saveToSupabase(data) {
    try {
        const { error } = await supabaseClient
            .from("asset_records")
            .upsert(
                {
                    base_date: data.baseDate,
                    values: data.values,
                    tree: data.tree
                },
                { onConflict: "base_date" }
            );

        if (error) {
            console.error("Supabase save error:", error);
            return { success: false, error: error };
        }

        return { success: true };

    } catch (e) {
        console.error("Supabase save exception:", e);
        return { success: false, error: e };
    }
}


async function loadFromSupabase(date) {
    try {
        const { data, error } = await supabaseClient
            .from("asset_records")
            .select("values, tree")
            .eq("base_date", date)
            .maybeSingle();

        if (error) {
            console.error("Supabase load error:", error);
            return { success: false, error: error };
        }

        if (!data) {
            return { success: true, data: null };
        }

        return {
            success: true,
            data: {
                values: data.values,
                tree: data.tree
            }
        };

    } catch (e) {
        console.error("Supabase load exception:", e);
        return { success: false, error: e };
    }
}


async function loadHistoryFromSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from("asset_records")
            .select("base_date, values, tree")
            .order("base_date", { ascending: true });

        if (error) {
            console.error("Supabase history error:", error);
            return { success: false, error: error };
        }

        return {
            success: true,
            data: (data || []).map(row => ({
                date: row.base_date,
                values: row.values,
                tree: row.tree
            }))
        };

    } catch (e) {
        console.error("Supabase history exception:", e);
        return { success: false, error: e };
    }
}


/* ==================================================
   입력값 수집
================================================== */

function collectValues() {
    const values = {};

    tree.forEach(root => {
        (root.children || []).forEach(middle => {
            const middleInput = document.getElementById("middle_value_" + middle.id);

            if (middleInput) {
                const raw = middleInput.dataset.rawValue;
                if (raw !== undefined && raw !== "") {
                    values[middle.id] = Number(raw) || 0;
                }
            }

            (middle.children || []).forEach(child => {
                const input = document.getElementById("value_" + child.id);
                if (!input) return;

                const raw = input.dataset.rawValue;
                if (raw !== undefined && raw !== "") {
                    values[child.id] = Number(raw) || 0;
                } else {
                    values[child.id] = 0;
                }
            });
        });
    });

    return values;
}


/* ==================================================
   INPUT RENDER
================================================== */

function renderInput() {
    const container = document.getElementById("inputTree");
    if (!container) return;

    container.innerHTML = "";

    createInputSection("asset", "자산", container);
    createInputSection("debt", "부채", container);
}


function createInputSection(type, name, container) {
    const roots = tree.filter(item => item.type === type);

    const card = document.createElement("div");
    card.className = "input-tree-card";

    const swiper = document.createElement("div");
    swiper.className = "swipe-row";

    const header = document.createElement("div");
    header.className = "input-section-header swipe-content";

    header.innerHTML = `
        <div class="input-section-left">
            <div class="input-section-icon ${type === "debt" ? "debt" : ""}">
                ${type === "debt" ? "−" : "+"}
            </div>
            <span>${escapeHtml(name)}</span>
        </div>
        <div class="input-section-arrow">›</div>
    `;

    const actions = createSwipeActions([
        { label: "추가", cls: "add", onClick: () => addRoot(type) }
    ]);

    swiper.appendChild(actions);
    swiper.appendChild(header);

    attachSwipe(swiper, header, actions);

    const list = document.createElement("div");
    list.className = "input-section-list";

    header.addEventListener("click", function () {
        if (header.dataset.swiped === "1") {
            header.dataset.swiped = "0";
            return;
        }
        header.classList.toggle("open");
        list.classList.toggle("open");
    });

    roots.forEach(root => list.appendChild(createRootElement(root)));

    card.appendChild(swiper);
    card.appendChild(list);
    container.appendChild(card);
}


function createRootElement(root) {
    const block = document.createElement("div");
    block.className = "root-block";

    const swiper = document.createElement("div");
    swiper.className = "swipe-row";

    const header = document.createElement("div");
    header.className = "tree-header swipe-content";

    const total = getRootTotal(root);

    header.innerHTML = `
        <div class="tree-name">
            <span class="tree-arrow">›</span>
            <span>${escapeHtml(root.name)}</span>
        </div>
        <div class="tree-total" id="root_total_${root.id}">
            ${getCurrencySymbolForRoot(root)}
            ${formatNumber(total)}
        </div>
    `;

    const actions = createSwipeActions([
        { label: "추가", cls: "add", onClick: () => addMiddle(root.id) }
    ]);

    swiper.appendChild(actions);
    swiper.appendChild(header);

    attachSwipe(swiper, header, actions);

    const middleList = document.createElement("div");
    middleList.className = "middle-list";

    header.addEventListener("click", function () {
        if (header.dataset.swiped === "1") {
            header.dataset.swiped = "0";
            return;
        }
        header.classList.toggle("open");
        middleList.classList.toggle("open");
    });

    (root.children || []).forEach(middle => {
        middleList.appendChild(createMiddleElement(middle));
    });

    block.appendChild(swiper);
    block.appendChild(middleList);

    return block;
}


function createMiddleElement(middle) {
    const block = document.createElement("div");
    block.className = "middle-block";

    const swiper = document.createElement("div");
    swiper.className = "swipe-row";

    const header = document.createElement("div");
    header.className = "middle-header swipe-content";

    const total = getMiddleTotal(middle);
    const directValue = getMiddleDirectValue(middle);

    header.innerHTML = `
        <div class="middle-name">
            <span class="middle-arrow">›</span>
            <span>${escapeHtml(middle.name)}</span>
        </div>
        <div class="middle-total-wrap">
            <div class="middle-money-input">
                <span class="currency-symbol">
                    ${getCurrencySymbolForMiddle(middle)}
                </span>
                <input
                    type="text"
                    inputmode="numeric"
                    id="middle_value_${middle.id}"
                    autocomplete="off"
                    placeholder="${formatNumber(total)}"
                >
            </div>
        </div>
    `;

    const actions = createSwipeActions([
        { label: "수정", cls: "edit", onClick: () => editMiddle(middle.id) },
        { label: "삭제", cls: "delete", onClick: () => deleteMiddle(middle.id) },
        { label: "추가", cls: "add", onClick: () => addChild(middle.id) }
    ]);

    swiper.appendChild(actions);
    swiper.appendChild(header);

    attachSwipe(swiper, header, actions);

    const childList = document.createElement("div");
    childList.className = "child-list";

    header.addEventListener("click", function (e) {
        if (e.target.closest("input")) return;

        if (header.dataset.swiped === "1") {
            header.dataset.swiped = "0";
            return;
        }

        header.classList.toggle("open");
        childList.classList.toggle("open");
    });

    const middleInput = header.querySelector("#middle_value_" + middle.id);

    if (directValue !== null) {
        middleInput.dataset.rawValue = directValue;
        middleInput.value = formatNumber(directValue);
    } else {
        middleInput.dataset.rawValue = "";
    }

    attachMoneyInput(middleInput, middle, "middle");

    (middle.children || []).forEach(child => {
        childList.appendChild(createChildElement(child));
    });

    block.appendChild(swiper);
    block.appendChild(childList);

    return block;
}


function createChildElement(child) {
    const swiper = document.createElement("div");
    swiper.className = "swipe-row input-row-swipe";

    const row = document.createElement("div");
    row.className = "input-row swipe-content";

    const currency = child.currency === "USD" ? "$" : "₩";

    row.innerHTML = `
        <span class="input-label">
            ${escapeHtml(child.name)}
        </span>
        <div class="money-input">
            <span class="currency-symbol">${currency}</span>
            <input
                type="text"
                inputmode="numeric"
                id="value_${child.id}"
                autocomplete="off"
                placeholder="0"
            >
        </div>
    `;

    const actions = createSwipeActions([
        { label: "수정", cls: "edit", onClick: () => editChild(child.id) },
        { label: "삭제", cls: "delete", onClick: () => deleteChild(child.id) }
    ]);

    swiper.appendChild(actions);
    swiper.appendChild(row);

    attachSwipe(swiper, row, actions);

    const input = row.querySelector("input");
    const saved = getLocalValues();
    const savedValue = saved[child.id];

    if (savedValue !== undefined) {
        input.dataset.rawValue = Number(savedValue) || 0;
        input.value = formatNumber(savedValue);
    } else {
        input.dataset.rawValue = "";
    }

    attachMoneyInput(input, child, "child");

    input.addEventListener("pointerdown", function (e) {
        e.stopPropagation();
    });

    return swiper;
}


/* ==================================================
   스와이프
================================================== */

function createSwipeActions(items) {
    const wrap = document.createElement("div");
    wrap.className = "swipe-actions";

    items.forEach(item => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "swipe-action-btn " + item.cls;
        btn.textContent = item.label;

        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            closeAllSwipes();
            item.onClick();
        });

        wrap.appendChild(btn);
    });

    return wrap;
}


function closeAllSwipes(except) {
    document.querySelectorAll(".swipe-content.swiped").forEach(el => {
        if (el === except) return;
        el.classList.remove("swiped");
        el.style.transform = "";
        el.dataset.swiped = "0";
    });
}


function attachSwipe(wrapper, content, actions) {
    let startX = 0, startY = 0, currentX = 0;
    let dragging = false, decided = false, isHorizontal = false;

    function getActionsWidth() {
        const w = actions.offsetWidth;
        if (w > 0) return w;
        const count = actions.children.length;
        return count * 44 + (count - 1) * 8 + 12;
    }

    function onStart(e) {
        if (e.target.closest("input")) return;

        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        currentX = 0;
        dragging = true;
        decided = false;
        isHorizontal = false;
        content.style.transition = "none";
    }

    function onMove(e) {
        if (!dragging) return;

        const touch = e.touches ? e.touches[0] : e;
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;

        if (!decided) {
            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                decided = true;
                isHorizontal = Math.abs(dx) > Math.abs(dy);
            }
            return;
        }

        if (!isHorizontal) return;
        if (e.cancelable) e.preventDefault();

        const actionsWidth = getActionsWidth();
        const base = content.classList.contains("swiped") ? -actionsWidth : 0;
        let offset = base + dx;

        if (offset > 0) offset = 0;
        if (offset < -actionsWidth) offset = -actionsWidth;

        currentX = offset;
        content.style.transform = `translateX(${offset}px)`;
    }

    function onEnd() {
        if (!dragging) return;
        dragging = false;

        content.style.transition = "transform .22s ease";

        const actionsWidth = getActionsWidth();
        const shouldOpen = isHorizontal && currentX < -actionsWidth / 2;

        if (shouldOpen) {
            closeAllSwipes(content);
            content.classList.add("swiped");
            content.style.transform = `translateX(${-actionsWidth}px)`;
            content.dataset.swiped = "1";
        } else {
            content.classList.remove("swiped");
            content.style.transform = "";
            content.dataset.swiped = "0";
        }

        currentX = 0;
    }

    content.addEventListener("touchstart", onStart, { passive: true });
    content.addEventListener("touchmove", onMove, { passive: false });
    content.addEventListener("touchend", onEnd);
    content.addEventListener("touchcancel", onEnd);

    content.addEventListener("mousedown", onStart);
    content.addEventListener("mousemove", onMove);
    content.addEventListener("mouseup", onEnd);
    content.addEventListener("mouseleave", onEnd);
}


/* ==================================================
   금액 입력
================================================== */

function attachMoneyInput(input, item, kind) {
    if (!input) return;

    input.addEventListener("focus", function () { this.select(); });

    input.addEventListener("input", function () {
        const raw = this.value.replace(/[^0-9]/g, "");

        if (raw === "") {
            this.dataset.rawValue = "";
            this.value = "";
        } else {
            const number = Number(raw);
            this.dataset.rawValue = number;
            this.value = formatNumber(number);
        }

        updateTotalsRealtime();
    });

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            this.blur();
        }
    });

    input.addEventListener("blur", function () {
        const raw = this.dataset.rawValue;

        if (raw === undefined || raw === "") {
            this.value = "";
            return;
        }

        this.value = formatNumber(raw);
        updateTotalsRealtime();
    });
}


function updateTotalsRealtime() {
    const values = collectValues();

    localStorage.setItem(
        "myAssetValues_" + selectedDate,
        JSON.stringify(values)
    );

    tree.forEach(root => {
        (root.children || []).forEach(middle => {
            const input = document.getElementById("middle_value_" + middle.id);
            const total = getMiddleTotal(middle);

            if (input && (input.dataset.rawValue === undefined || input.dataset.rawValue === "")) {
                input.placeholder = formatNumber(total);
            }

            updateRootTotal(root);
        });
    });

    updateHome();
}


/* ==================================================
   합계 / 유틸
================================================== */

function getMiddleDirectValue(middle) {
    const values = getLocalValues();
    if (Object.prototype.hasOwnProperty.call(values, middle.id)) {
        return Number(values[middle.id]) || 0;
    }
    return null;
}


function getMiddleTotal(middle) {
    const values = getLocalValues();
    if (Object.prototype.hasOwnProperty.call(values, middle.id)) {
        return Number(values[middle.id]) || 0;
    }

    let total = 0;
    (middle.children || []).forEach(child => {
        total += Number(values[child.id] || 0);
    });
    return total;
}


function getRootTotal(root) {
    let total = 0;
    (root.children || []).forEach(middle => {
        total += getMiddleTotal(middle);
    });
    return total;
}


function updateRootTotal(root) {
    const element = document.getElementById("root_total_" + root.id);
    if (!element) return;

    const total = getRootTotal(root);
    element.textContent =
        getCurrencySymbolForRoot(root) + formatNumber(total);
}


function getCurrencySymbolForRoot(root) { return "₩"; }


function getCurrencySymbolForMiddle(middle) {
    const children = middle.children || [];
    const hasUSD = children.some(child => child.currency === "USD");
    const hasKRW = children.some(child => child.currency !== "USD");

    if (hasUSD && !hasKRW) return "$";
    return "₩";
}


function setLoadStatus(status) {
    const element = document.getElementById("loadStatus");
    if (!element) return;

    element.className = "load-status";

    if (status === "loading") element.classList.add("loading");
    else if (status === "success") element.classList.add("success");
    else if (status === "error") element.classList.add("error");
}


/* ==================================================
   CRUD
================================================== */

function addRoot(type) {
    const name = prompt("추가할 대분류 이름");
    if (!name || !name.trim()) return;

    tree.push({
        id: makeId(),
        name: name.trim(),
        type: type,
        children: []
    });

    saveTree();
    renderInput();
    updateHome();
}


function addMiddle(rootId) {
    const root = findRoot(rootId);
    if (!root) return;

    const name = prompt(`"${root.name}" 아래에 추가할 중분류`);
    if (!name || !name.trim()) return;

    root.children = root.children || [];
    root.children.push({
        id: makeId(),
        name: name.trim(),
        children: []
    });

    saveTree();
    renderInput();
    updateHome();
}


function addChild(middleId) {
    const middle = findMiddle(middleId);
    if (!middle) return;

    const name = prompt(`"${middle.name}" 아래에 추가할 소분류`);
    if (!name || !name.trim()) return;

    middle.children = middle.children || [];
    middle.children.push({
        id: makeId(),
        name: name.trim(),
        children: []
    });

    saveTree();
    renderInput();
    updateHome();
}


function editMiddle(id) {
    const middle = findMiddle(id);
    if (!middle) return;

    const name = prompt("중분류 이름 수정", middle.name);
    if (!name || !name.trim()) return;

    middle.name = name.trim();
    saveTree();
    renderInput();
    updateHome();
}


function editChild(id) {
    const result = findChild(id);
    if (!result) return;

    const child = result.child;
    const name = prompt("소분류 이름 수정", child.name);
    if (!name || !name.trim()) return;

    child.name = name.trim();
    saveTree();
    renderInput();
    updateHome();
}


function deleteMiddle(id) {
    const result = findMiddleWithRoot(id);
    if (!result) return;

    const middle = result.middle;
    const ids = [middle.id, ...(middle.children || []).map(child => child.id)];

    if (!confirm(`"${middle.name}"을 삭제할까요?`)) return;

    result.root.children =
        (result.root.children || []).filter(item => item.id !== id);

    removeValues(ids);
    saveTree();
    renderInput();
    updateHome();
}


function deleteChild(id) {
    const result = findChild(id);
    if (!result) return;

    if (!confirm(`"${result.child.name}"을 삭제할까요?`)) return;

    result.middle.children =
        (result.middle.children || []).filter(child => child.id !== id);

    removeValues([id]);
    saveTree();
    renderInput();
    updateHome();
}


function removeValues(ids) {
    const values = getLocalValues();
    ids.forEach(id => delete values[id]);

    localStorage.setItem(
        "myAssetValues_" + selectedDate,
        JSON.stringify(values)
    );
}


/* ==================================================
   찾기 / ID
================================================== */

function findRoot(id) {
    return tree.find(item => item.id === id);
}


function findMiddle(id) {
    for (const root of tree) {
        const middle = (root.children || []).find(item => item.id === id);
        if (middle) return middle;
    }
    return null;
}


function findMiddleWithRoot(id) {
    for (const root of tree) {
        const middle = (root.children || []).find(item => item.id === id);
        if (middle) return { root, middle };
    }
    return null;
}


function findChild(id) {
    for (const root of tree) {
        for (const middle of (root.children || [])) {
            const child = (middle.children || []).find(item => item.id === id);
            if (child) return { root, middle, child };
        }
    }
    return null;
}


function makeId() {
    return "custom_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
}


/* ==================================================
   HOME
================================================== */

function updateHome() {
    const values = getLocalValues();

    let assetTotal = 0;
    let debtTotal = 0;
    let realEstateTotal = 0;

    tree.forEach(root => {
        const total = getRootTotal(root);

        if (root.type === "debt") {
            debtTotal += total;
        } else {
            assetTotal += total;
            if (root.id === "asset_realestate") realEstateTotal += total;
        }
    });

    const netWorthExcludingRealEstate =
        assetTotal - realEstateTotal - debtTotal;

    const assetElement = document.getElementById("assetTotal");
    const debtElement = document.getElementById("debtTotal");
    const netElement = document.getElementById("netWorth");
    const netExcludingElement = document.getElementById("netWorthExcludingRealEstate");

    if (assetElement) assetElement.textContent = formatNumber(assetTotal);
    if (debtElement) debtElement.textContent = formatNumber(debtTotal);
    if (netElement) netElement.textContent = formatNumber(assetTotal - debtTotal);
    if (netExcludingElement) {
        netExcludingElement.textContent = formatNumber(netWorthExcludingRealEstate);
    }

    renderHome(tree.filter(x => x.type === "asset"), "homeAssets", values, false);
    renderHome(tree.filter(x => x.type === "debt"), "homeDebts", values, true);
}


function renderHome(roots, containerId, values, isDebt) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    roots.forEach(root => {
        const item = document.createElement("div");
        item.className = "category-item";

        const rootTotal = getRootTotal(root);
        const header = document.createElement("div");
        header.className = "category-header";

        header.innerHTML = `
            <div class="category-left">
                <div class="category-icon ${isDebt ? "debt" : ""}">
                    ${isDebt ? "−" : "+"}
                </div>
                <span>${escapeHtml(root.name)}</span>
            </div>
            <div class="category-right">
                ₩
                ${formatNumber(rootTotal)}
                <span class="arrow">›</span>
            </div>
        `;

        const list = document.createElement("div");
        list.className = "subcategory-list";

        header.addEventListener("click", function () {
            header.classList.toggle("open");
            list.classList.toggle("open");
        });

        (root.children || []).forEach(middle => {
            const middleBlock = document.createElement("div");
            middleBlock.className = "category-item";

            const middleTotal = getMiddleTotal(middle);
            const middleHeader = document.createElement("div");
            middleHeader.className = "category-header";

            middleHeader.innerHTML = `
                <div class="category-left">
                    <span>${escapeHtml(middle.name)}</span>
                </div>
                <div class="category-right">
                    ${getCurrencySymbolForMiddle(middle)}
                    ${formatNumber(middleTotal)}
                    <span class="arrow">›</span>
                </div>
            `;

            const children = document.createElement("div");
            children.className = "subcategory-list";

            middleHeader.addEventListener("click", function (e) {
                e.stopPropagation();
                middleHeader.classList.toggle("open");
                children.classList.toggle("open");
            });

            (middle.children || []).forEach(child => {
                const row = document.createElement("div");
                row.className = "subcategory-row";
                const currency = child.currency === "USD" ? "$" : "₩";

                row.innerHTML = `
                    <span>${escapeHtml(child.name)}</span>
                    <span>${currency}${formatNumber(values[child.id] || 0)}</span>
                `;

                children.appendChild(row);
            });

            middleBlock.appendChild(middleHeader);
            middleBlock.appendChild(children);
            list.appendChild(middleBlock);
        });

        item.appendChild(header);
        item.appendChild(list);
        container.appendChild(item);
    });
}


/* ==================================================
   날짜 데이터 로딩
================================================== */

async function loadDateData() {
    setLoadStatus("loading");

    const local = getLocalValues();
    if (local) updateHome();

    try {
        let result = await loadFromSupabase(selectedDate);

        const hasData =
            result &&
            result.success &&
            result.data &&
            result.data.values &&
            Object.keys(result.data.values).length > 0;

        if (!hasData) {
            const historyResult = await loadHistoryFromSupabase();

            if (historyResult && historyResult.success &&
                Array.isArray(historyResult.data) &&
                historyResult.data.length > 0) {

                const sortedHistory = historyResult.data
                    .filter(item => item && item.date && item.date < selectedDate)
                    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

                if (sortedHistory.length > 0) {
                    const mostRecent = sortedHistory[0];
                    result = {
                        success: true,
                        data: {
                            tree: mostRecent.tree,
                            values: mostRecent.values
                        }
                    };
                }
            }
        }

        if (result && result.success && result.data) {
            if (result.data.tree && Array.isArray(result.data.tree) && result.data.tree.length) {
                tree = result.data.tree;
                normalizeTree();
                saveTree();
            }

            if (result.data.values) {
                localStorage.setItem(
                    "myAssetValues_" + selectedDate,
                    JSON.stringify(result.data.values)
                );
            }

            renderInput();
            updateHome();
            setLoadStatus("success");
        } else {
            renderInput();
            updateHome();
            setLoadStatus("error");
        }
    } catch (error) {
        console.error("날짜 데이터 불러오기 오류:", error);
        renderInput();
        updateHome();
        setLoadStatus("error");
    }
}


/* ==================================================
   NORMALIZE / LOCAL
================================================== */

function normalizeTree() {
    tree.forEach(root => {
        root.children = root.children || [];
        root.children.forEach(middle => {
            middle.children = middle.children || [];
        });
    });
}


function getLocalValues() {
    try {
        return JSON.parse(
            localStorage.getItem("myAssetValues_" + selectedDate) || "{}"
        );
    } catch (e) {
        return {};
    }
}


function loadTree() {
    try {
        const stored = JSON.parse(localStorage.getItem("myAssetTree") || "null");
        if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) { /* ignore */ }

    return JSON.parse(JSON.stringify(DEFAULT_TREE));
}


function saveTree() {
    localStorage.setItem("myAssetTree", JSON.stringify(tree));
}


/* ==================================================
   숫자 / HTML
================================================== */

function formatNumber(number) {
    return Math.round(Number(number) || 0).toLocaleString("ko-KR");
}


function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];
    });
}


/* ==================================================
   분석 설정
================================================== */

function loadAnalysisConfig() {
    try {
        const stored = JSON.parse(
            localStorage.getItem("myAssetAnalysisConfig") || "null"
        );

        if (Array.isArray(stored) && stored.length > 0) {
            const map = new Map();
            stored.forEach(item => map.set(item.id, item));

            const merged = [];

            stored.forEach(item => {
                const def = ANALYSIS_SECTIONS.find(s => s.id === item.id);
                if (def) {
                    merged.push({
                        id: item.id,
                        name: item.name || def.name,
                        enabled: item.enabled !== false
                    });
                }
            });

            ANALYSIS_SECTIONS.forEach(def => {
                if (!map.has(def.id)) {
                    merged.push({
                        id: def.id,
                        name: def.name,
                        enabled: def.defaultOn
                    });
                }
            });

            return merged;
        }
    } catch (e) { /* ignore */ }

    return ANALYSIS_SECTIONS.map(s => ({
        id: s.id,
        name: s.name,
        enabled: s.defaultOn
    }));
}


function saveAnalysisConfig() {
    localStorage.setItem(
        "myAssetAnalysisConfig",
        JSON.stringify(analysisConfig)
    );
}


/* ==================================================
   목표
================================================== */

function loadGoals() {
    try {
        const stored = JSON.parse(localStorage.getItem("myAssetGoals") || "null");
        if (stored && typeof stored === "object") {
            return {
                netWorth: Number(stored.netWorth) || 0,
                excludingRealEstate: Number(stored.excludingRealEstate) || 0,
                investment: Number(stored.investment) || 0,
                fire: Number(stored.fire) || 0
            };
        }
    } catch (e) { /* ignore */ }

    return { netWorth: 0, excludingRealEstate: 0, investment: 0, fire: 0 };
}


function saveGoals() {
    localStorage.setItem("myAssetGoals", JSON.stringify(goals));
}


/* ==================================================
   설정 초기화 및 렌더
================================================== */

function initSettings() {
    const resetBtn = document.getElementById("resetLocalButton");
    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            if (!confirm("로컬 데이터를 초기화할까요?\n(트리, 입력값, 분석설정, 목표)")) return;

            localStorage.removeItem("myAssetTree");
            localStorage.removeItem("myAssetAnalysisConfig");
            localStorage.removeItem("myAssetGoals");
            localStorage.removeItem("myAssetSelectedDate");

            Object.keys(localStorage)
                .filter(k => k.startsWith("myAssetValues_"))
                .forEach(k => localStorage.removeItem(k));

            location.reload();
        });
    }

    const goalSaveBtn = document.getElementById("goalSaveButton");
    if (goalSaveBtn) {
        goalSaveBtn.addEventListener("click", function () {
            const fields = document.querySelectorAll(".goal-input-field");

            fields.forEach(f => {
                const key = f.dataset.key;
                const raw = f.value.replace(/[^0-9]/g, "");
                goals[key] = Number(raw) || 0;
            });

            saveGoals();

            goalSaveBtn.textContent = "저장 완료!";
            setTimeout(() => {
                goalSaveBtn.textContent = "목표 저장";
            }, 1200);
        });
    }
}


function renderSettings() {
    renderGoalSettings();
    renderAnalysisSettings();
}


function renderGoalSettings() {
    const list = document.getElementById("goalSettingsList");
    if (!list) return;

    list.innerHTML = "";

    const fields = [
        { key: "netWorth",            label: "목표 순자산" },
        { key: "excludingRealEstate", label: "목표 부동산 제외 순자산" },
        { key: "investment",          label: "목표 투자자산" },
        { key: "fire",                label: "FIRE 자산 목표" }
    ];

    fields.forEach(field => {
        const row = document.createElement("div");
        row.className = "goal-input-row";

        const label = document.createElement("div");
        label.className = "goal-input-label";
        label.textContent = field.label;

        const input = document.createElement("input");
        input.type = "text";
        input.inputMode = "numeric";
        input.className = "goal-input-field";
        input.dataset.key = field.key;
        input.placeholder = "0";
        input.value = goals[field.key]
            ? formatNumber(goals[field.key])
            : "";

        input.addEventListener("input", function () {
            const raw = this.value.replace(/[^0-9]/g, "");
            this.value = raw ? formatNumber(raw) : "";
        });

        row.appendChild(label);
        row.appendChild(input);
        list.appendChild(row);
    });
}


function renderAnalysisSettings() {
    const list = document.getElementById("analysisSettingsList");
    if (!list) return;

    list.innerHTML = "";

    analysisConfig.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "settings-row";

        const orderWrap = document.createElement("div");
        orderWrap.className = "settings-row-order";

        const upBtn = document.createElement("button");
        upBtn.type = "button";
        upBtn.className = "settings-order-btn";
        upBtn.textContent = "▲";
        upBtn.disabled = index === 0;
        upBtn.addEventListener("click", () => moveAnalysis(index, -1));

        const downBtn = document.createElement("button");
        downBtn.type = "button";
        downBtn.className = "settings-order-btn";
        downBtn.textContent = "▼";
        downBtn.disabled = index === analysisConfig.length - 1;
        downBtn.addEventListener("click", () => moveAnalysis(index, 1));

        orderWrap.appendChild(upBtn);
        orderWrap.appendChild(downBtn);

        const nameEl = document.createElement("div");
        nameEl.className = "settings-row-name";
        nameEl.textContent = item.name;

        const toggle = document.createElement("div");
        toggle.className = "toggle" + (item.enabled ? " on" : "");
        toggle.addEventListener("click", () => {
            analysisConfig[index].enabled = !analysisConfig[index].enabled;
            saveAnalysisConfig();
            renderAnalysisSettings();
        });

        row.appendChild(orderWrap);
        row.appendChild(nameEl);
        row.appendChild(toggle);

        list.appendChild(row);
    });
}


function moveAnalysis(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= analysisConfig.length) return;

    const tmp = analysisConfig[index];
    analysisConfig[index] = analysisConfig[target];
    analysisConfig[target] = tmp;

    saveAnalysisConfig();
    renderAnalysisSettings();
}


/* ==================================================
   ANALYSIS RENDER
================================================== */

async function renderAnalysis() {
    const container = document.getElementById("analysisContainer");
    if (!container) return;

    container.innerHTML = `<div class="analysis-card">
        <div class="analysis-empty">분석 데이터를 불러오는 중...</div>
    </div>`;

    try {
        const result = await loadHistoryFromSupabase();

        if (!result || !result.success || !Array.isArray(result.data)) {
            container.innerHTML = `<div class="analysis-card">
                <div class="analysis-empty">분석 데이터를 불러오지 못했습니다.</div>
            </div>`;
            return;
        }

        analysisHistory = result.data
            .filter(item => item && item.date)
            .sort((a, b) => String(a.date).localeCompare(String(b.date)));

        analysisLoaded = true;

        if (analysisHistory.length === 0) {
            container.innerHTML = `<div class="analysis-card">
                <div class="analysis-empty">저장된 날짜 데이터가 없습니다.</div>
            </div>`;
            return;
        }

        container.innerHTML = "";

        analysisConfig.forEach(item => {
            if (!item.enabled) return;

            switch (item.id) {

                case "metricCards":
                    container.appendChild(createMetricCards());
                    break;

                case "netWorthChart":
                    container.appendChild(createChartCard("순자산 추이", "netWorthChart"));
                    setTimeout(() => drawNetWorthChart(), 0);
                    break;

                case "assetDebtChart":
                    container.appendChild(createChartCardWithLegend(
                        "자산 · 부채 추이",
                        "assetDebtChart",
                        [
                            { cls: "asset-line", label: "자산(부동산 제외)" },
                            { cls: "debt-line",  label: "부채" }
                        ]
                    ));
                    setTimeout(() => drawAssetDebtChart(), 0);
                    break;

                case "donutAsset":
                    container.appendChild(createDonutCard());
                    break;

                case "debtRepayChart":
                    container.appendChild(createChartCard("부채 상환 추이", "debtRepayChart"));
                    setTimeout(() => drawDebtRepayChart(), 0);
                    break;

                case "monthlyIncrease":
                    container.appendChild(createChartCard("월별 순자산 증가액", "monthlyIncreaseChart"));
                    setTimeout(() => drawMonthlyIncreaseChart(), 0);
                    break;

                case "investmentChart":
                    container.appendChild(createChartCardWithLegend(
                        "투자자산 변동",
                        "investmentChart",
                        [
                            { cls: "stock-line", label: "주식" },
                            { cls: "coin-line",  label: "비트코인" }
                        ]
                    ));
                    setTimeout(() => drawInvestmentChart(), 0);
                    break;

                case "contribution":
                    container.appendChild(createContributionCard());
                    break;

                case "allocation":
                    container.appendChild(createChartCardWithLegend(
                        "자산배분 비중 추이",
                        "allocationChart",
                        [
                            { cls: "realestate-line", label: "부동산" },
                            { cls: "asset-line",      label: "투자자산" },
                            { cls: "cash-line",       label: "현금성자산" },
                            { cls: "etc-line",        label: "기타" }
                        ]
                    ));
                    setTimeout(() => drawAllocationChart(), 0);
                    break;

                case "goalProgress":
                    container.appendChild(createGoalCard());
                    break;

                case "monthlySummary":
                    container.appendChild(createMonthlySummaryCard());
                    break;
            }
        });

    } catch (error) {
        console.error("분석 데이터 오류:", error);
        container.innerHTML = `<div class="analysis-card">
            <div class="analysis-empty">분석 데이터를 불러오지 못했습니다.</div>
        </div>`;
    }
}


/* ==================================================
   카드 헬퍼
================================================== */

function createChartCard(title, containerId) {
    const card = document.createElement("section");
    card.className = "analysis-card";
    card.innerHTML = `
        <div class="analysis-title"><div>${escapeHtml(title)}</div></div>
        <div class="chart-container" id="${containerId}"></div>
    `;
    return card;
}


function createChartCardWithLegend(title, containerId, legendItems) {
    const legend = legendItems.map(l =>
        `<div class="legend-item">
            <span class="legend-dot ${l.cls}"></span>
            <span>${escapeHtml(l.label)}</span>
        </div>`
    ).join("");

    const card = document.createElement("section");
    card.className = "analysis-card";
    card.innerHTML = `
        <div class="analysis-title"><div>${escapeHtml(title)}</div></div>
        <div class="chart-legend">${legend}</div>
        <div class="chart-container" id="${containerId}"></div>
    `;
    return card;
}


/* ==================================================
   히스토리 지표
================================================== */

function getHistoryMetrics(record) {
    const values = record.values || {};
    const historyTree = Array.isArray(record.tree) ? record.tree : [];

    let totalAsset = 0, totalDebt = 0, realEstate = 0;
    let stocks = 0, coin = 0, investment = 0, cash = 0, cashgift = 0, etc = 0;

    historyTree.forEach(root => {
        const rootTotal = getHistoryRootTotal(root, values);

        if (root.type === "debt") {
            totalDebt += rootTotal;
            return;
        }

        totalAsset += rootTotal;

        if (root.id === "asset_realestate") realEstate += rootTotal;
        if (root.id === "asset_investment") investment += rootTotal;
        if (root.id === "asset_cash") cash += rootTotal;
        if (root.id === "asset_cashgift") cashgift += rootTotal;
        if (root.id === "asset_etc") etc += rootTotal;

        if (root.id === "asset_investment") {
            (root.children || []).forEach(middle => {
                const value = getHistoryMiddleTotal(middle, values);
                if (middle.id === "koreaStock" || middle.id === "usStock") stocks += value;
                if (middle.id === "coin") coin += value;
            });
        }
    });

    return {
        asset: totalAsset,
        debt: totalDebt,
        netWorth: totalAsset - totalDebt,
        assetExcludingRealEstate: totalAsset - realEstate,
        stocks: stocks,
        coin: coin,
        realEstate: realEstate,
        investment: investment,
        cash: cash,
        cashgift: cashgift,
        etc: etc
    };
}


function getHistoryRootTotal(root, values) {
    let total = 0;
    (root.children || []).forEach(middle => {
        total += getHistoryMiddleTotal(middle, values);
    });
    return total;
}


function getHistoryMiddleTotal(middle, values) {
    if (Object.prototype.hasOwnProperty.call(values, middle.id)) {
        return Number(values[middle.id]) || 0;
    }

    let total = 0;
    (middle.children || []).forEach(child => {
        total += Number(values[child.id] || 0);
    });
    return total;
}


function getAnalysisSeries(metricNames) {
    return analysisHistory.map(record => {
        const metrics = getHistoryMetrics(record);
        const result = { date: record.date };

        metricNames.forEach(name => {
            result[name] = Number(metrics[name]) || 0;
        });

        return result;
    });
}


/* ==================================================
   Metric cards
================================================== */

function createMetricCards() {
    const card = document.createElement("section");
    card.className = "analysis-card";

    const latest = analysisHistory[analysisHistory.length - 1];
    const metrics = getHistoryMetrics(latest);

    const prevMonth = findRecordOffset(latest.date, "month");
    const prevMonthMetrics = prevMonth ? getHistoryMetrics(prevMonth) : null;

    const items = [
        { label: "순자산",            key: "netWorth",                invert: false },
        { label: "부동산 제외 순자산", key: "assetExcludingRealEstate", invert: false },
        { label: "총자산",            key: "asset",                   invert: false },
        { label: "총부채",            key: "debt",                    invert: true  },
        { label: "투자자산",          key: "investment",              invert: false },
        { label: "현금성자산",        key: "cash",                    invert: false }
    ];

    const grid = document.createElement("div");
    grid.className = "metric-grid";

    items.forEach(item => {
        const value = Number(metrics[item.key]) || 0;

        const el = document.createElement("div");
        el.className = "metric-card";

        let deltaHTML = "";

        if (prevMonthMetrics) {
            const diff = value - (Number(prevMonthMetrics[item.key]) || 0);

            if (diff !== 0) {
                const sign = diff > 0 ? "+" : "−";
                const abs = Math.abs(diff);

                let cls;
                if (item.invert) cls = diff > 0 ? "down" : "up";
                else cls = diff > 0 ? "up" : "down";

                deltaHTML = `<div class="metric-delta ${cls}">
                    전월 ${sign}₩${formatNumber(abs)}
                </div>`;
            } else {
                deltaHTML = `<div class="metric-delta neutral">전월 변동 없음</div>`;
            }
        }

        el.innerHTML = `
            <div class="metric-label">${escapeHtml(item.label)}</div>
            <div class="metric-value">₩${formatNumber(value)}</div>
            ${deltaHTML}
        `;

        grid.appendChild(el);
    });

    card.appendChild(grid);
    return card;
}


/* ==================================================
   Donut
================================================== */

function createDonutCard() {
    const card = document.createElement("section");
    card.className = "analysis-card";

    const latest = analysisHistory[analysisHistory.length - 1];
    const metrics = getHistoryMetrics(latest);

    const data = [
        { name: "부동산",      value: metrics.realEstate, color: "#f2994a" },
        { name: "투자자산",    value: metrics.investment, color: "#2f80ed" },
        { name: "현금성자산",  value: metrics.cash,       color: "#56ccf2" },
        { name: "현금·상품권", value: metrics.cashgift,   color: "#27ae60" },
        { name: "기타자산",    value: metrics.etc,        color: "#bb6bd9" }
    ].filter(d => d.value > 0);

    const total = data.reduce((s, d) => s + d.value, 0);

    const title = document.createElement("div");
    title.className = "analysis-title";
    title.innerHTML = `<div>자산 구성 (${formatFullDate(latest.date)})</div>`;

    const wrap = document.createElement("div");
    wrap.className = "donut-wrap";

    const svgWrap = document.createElement("div");
    svgWrap.className = "donut-svg-wrap";

    if (total > 0) {
        svgWrap.appendChild(createDonutSVG(data, total, 160));
    } else {
        svgWrap.innerHTML = `<div class="analysis-empty" style="min-height:160px;">데이터 없음</div>`;
    }

    const legend = document.createElement("div");
    legend.className = "donut-legend";

    data.forEach(d => {
        const pct = total > 0 ? (d.value / total * 100) : 0;
        const item = document.createElement("div");
        item.className = "donut-legend-item";
        item.innerHTML = `
            <span class="donut-legend-color" style="background:${d.color};"></span>
            <span class="donut-legend-name">${escapeHtml(d.name)}</span>
            <span class="donut-legend-pct">${pct.toFixed(1)}%</span>
        `;
        legend.appendChild(item);
    });

    wrap.appendChild(svgWrap);
    wrap.appendChild(legend);

    card.appendChild(title);
    card.appendChild(wrap);

    return card;
}


function createDonutSVG(data, total, size) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);

    const cx = size / 2, cy = size / 2;
    const r = size / 2 - 10;
    const strokeW = 22;

    let startAngle = -Math.PI / 2;

    data.forEach(d => {
        const angle = (d.value / total) * Math.PI * 2;
        const endAngle = startAngle + angle;

        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);

        const largeArc = angle > Math.PI ? 1 : 0;

        const path = document.createElementNS(ns, "path");
        path.setAttribute(
            "d",
            `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
        );
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", d.color);
        path.setAttribute("stroke-width", strokeW);

        svg.appendChild(path);

        startAngle = endAngle;
    });

    return svg;
}


/* ==================================================
   Contribution
================================================== */

function createContributionCard() {
    const card = document.createElement("section");
    card.className = "analysis-card";

    const latest = analysisHistory[analysisHistory.length - 1];
    const prev = findRecordOffset(latest.date, "month");

    const title = document.createElement("div");
    title.className = "analysis-title";
    title.innerHTML = `<div>자산 증가 기여도 (전월 대비)</div>`;
    card.appendChild(title);

    if (!prev) {
        const empty = document.createElement("div");
        empty.className = "analysis-empty";
        empty.style.minHeight = "100px";
        empty.textContent = "비교할 이전 기록이 없습니다.";
        card.appendChild(empty);
        return card;
    }

    const cur = getHistoryMetrics(latest);
    const prv = getHistoryMetrics(prev);

    const contrib = [
        { name: "부동산",      value: cur.realEstate - prv.realEstate },
        { name: "투자자산",    value: cur.investment - prv.investment },
        { name: "현금성자산",  value: cur.cash - prv.cash },
        { name: "현금·상품권", value: cur.cashgift - prv.cashgift },
        { name: "기타자산",    value: cur.etc - prv.etc },
        { name: "부채 감소",   value: prv.debt - cur.debt }
    ];

    const maxAbs = Math.max(...contrib.map(c => Math.abs(c.value)), 1);

    const list = document.createElement("div");
    list.className = "contrib-list";

    contrib.forEach(c => {
        const row = document.createElement("div");
        row.className = "contrib-row";

        const cls = c.value > 0 ? "pos" : c.value < 0 ? "neg" : "zero";
        const sign = c.value > 0 ? "+" : c.value < 0 ? "−" : "";
        const pct = Math.abs(c.value) / maxAbs * 100;

        row.innerHTML = `
            <span class="contrib-name">${escapeHtml(c.name)}</span>
            <div class="contrib-bar-wrap ${cls}">
                <div class="contrib-bar ${cls}" style="width:${pct}%;"></div>
            </div>
            <span class="contrib-value ${cls}">${sign}₩${formatNumber(Math.abs(c.value))}</span>
        `;

        list.appendChild(row);
    });

    card.appendChild(list);
    return card;
}


/* ==================================================
   Goal
================================================== */

function createGoalCard() {
    const card = document.createElement("section");
    card.className = "analysis-card";

    const title = document.createElement("div");
    title.className = "analysis-title";
    title.innerHTML = `<div>목표 진행률</div>`;
    card.appendChild(title);

    const latest = analysisHistory[analysisHistory.length - 1];
    const metrics = getHistoryMetrics(latest);

    const items = [
        { name: "목표 순자산",             current: metrics.netWorth,                 target: goals.netWorth },
        { name: "목표 부동산 제외 순자산",  current: metrics.assetExcludingRealEstate, target: goals.excludingRealEstate },
        { name: "목표 투자자산",           current: metrics.investment,               target: goals.investment },
        { name: "FIRE 자산",               current: metrics.assetExcludingRealEstate, target: goals.fire }
    ].filter(item => item.target > 0);

    if (items.length === 0) {
        const empty = document.createElement("div");
        empty.className = "analysis-empty";
        empty.style.minHeight = "100px";
        empty.textContent = "설정에서 목표 금액을 입력해주세요.";
        card.appendChild(empty);
        return card;
    }

    items.forEach(item => {
        const pct = Math.min(100, (item.current / item.target) * 100);

        const el = document.createElement("div");
        el.className = "goal-item";
        el.innerHTML = `
            <div class="goal-head">
                <div class="name">${escapeHtml(item.name)}</div>
                <div class="progress">${pct.toFixed(1)}%</div>
            </div>
            <div class="goal-bar-bg">
                <div class="goal-bar" style="width:${pct}%;"></div>
            </div>
            <div class="goal-foot">
                <span>현재 ₩${formatNumber(item.current)}</span>
                <span>목표 ₩${formatNumber(item.target)}</span>
            </div>
        `;
        card.appendChild(el);
    });

    return card;
}


/* ==================================================
   Monthly summary
================================================== */

function createMonthlySummaryCard() {
    const card = document.createElement("section");
    card.className = "analysis-card";

    const latest = analysisHistory[analysisHistory.length - 1];
    const prev = findRecordOffset(latest.date, "month");

    const title = document.createElement("div");
    title.className = "analysis-title";
    title.innerHTML = `<div>이번 달 요약 (${formatFullDate(latest.date)})</div>`;
    card.appendChild(title);

    if (!prev) {
        const empty = document.createElement("div");
        empty.className = "analysis-empty";
        empty.style.minHeight = "100px";
        empty.textContent = "비교할 이전 기록이 없습니다.";
        card.appendChild(empty);
        return card;
    }

    const cur = getHistoryMetrics(latest);
    const prv = getHistoryMetrics(prev);

    const netDiff = cur.netWorth - prv.netWorth;
    const pctChange = prv.netWorth !== 0 ? (netDiff / Math.abs(prv.netWorth) * 100) : 0;

    const contrib = [
        { name: "부동산",      value: cur.realEstate - prv.realEstate },
        { name: "투자자산",    value: cur.investment - prv.investment },
        { name: "현금성자산",  value: cur.cash - prv.cash },
        { name: "현금·상품권", value: cur.cashgift - prv.cashgift },
        { name: "기타자산",    value: cur.etc - prv.etc },
        { name: "부채 감소",   value: prv.debt - cur.debt }
    ];

    const positive = contrib.filter(c => c.value > 0).sort((a, b) => b.value - a.value);
    const negative = contrib.filter(c => c.value < 0).sort((a, b) => a.value - b.value);

    const wrap = document.createElement("div");
    wrap.className = "monthly-summary";

    const netClass = netDiff > 0 ? "up" : netDiff < 0 ? "down" : "";
    const netSign = netDiff > 0 ? "+" : netDiff < 0 ? "−" : "";

    wrap.innerHTML = [
        `<div class="summary-row">
            <span class="label">순자산 변화</span>
            <span class="value ${netClass}">${netSign}₩${formatNumber(Math.abs(netDiff))} (${pctChange.toFixed(2)}%)</span>
        </div>`,
        positive.length
            ? `<div class="summary-row">
                <span class="label">가장 많이 늘어난 항목</span>
                <span class="value up">${escapeHtml(positive[0].name)} +₩${formatNumber(positive[0].value)}</span>
               </div>`
            : "",
        negative.length
            ? `<div class="summary-row">
                <span class="label">가장 많이 줄어든 항목</span>
                <span class="value down">${escapeHtml(negative[0].name)} −₩${formatNumber(Math.abs(negative[0].value))}</span>
               </div>`
            : ""
    ].join("");

    card.appendChild(wrap);
    return card;
}


/* ==================================================
   offset 기록 찾기
================================================== */

function findRecordOffset(baseDate, type) {
    if (!baseDate) return null;

    const base = new Date(baseDate);
    const targetDate = new Date(base);

    if (type === "month") targetDate.setMonth(targetDate.getMonth() - 1);
    if (type === "year")  targetDate.setFullYear(targetDate.getFullYear() - 1);

    const candidates = analysisHistory.filter(r => {
        const d = new Date(r.date);
        return d <= targetDate;
    });

    if (candidates.length === 0) return null;

    return candidates[candidates.length - 1];
}


/* ==================================================
   DRAW CHARTS
================================================== */

function drawNetWorthChart() {
    const series = getAnalysisSeries(["netWorth"]);
    createLineChart({
        containerId: "netWorthChart",
        series: [{ key: "netWorth", name: "순자산", color: "#171717" }],
        data: series
    });
}

function drawAssetDebtChart() {
    const series = getAnalysisSeries(["assetExcludingRealEstate", "debt"]);
    createLineChart({
        containerId: "assetDebtChart",
        series: [
            { key: "assetExcludingRealEstate", name: "자산(부동산 제외)", color: "#2f80ed" },
            { key: "debt", name: "부채", color: "#eb5757" }
        ],
        data: series
    });
}

function drawInvestmentChart() {
    const series = getAnalysisSeries(["stocks", "coin"]);
    createLineChart({
        containerId: "investmentChart",
        series: [
            { key: "stocks", name: "주식", color: "#27ae60" },
            { key: "coin", name: "비트코인", color: "#9b51e0" }
        ],
        data: series
    });
}

function drawDebtRepayChart() {
    const series = getAnalysisSeries(["debt"]);
    createLineChart({
        containerId: "debtRepayChart",
        series: [{ key: "debt", name: "총부채", color: "#eb5757" }],
        data: series
    });
}

function drawAllocationChart() {
    const series = getAnalysisSeries([
        "realEstate", "investment", "cash", "etc"
    ]);
    createLineChart({
        containerId: "allocationChart",
        series: [
            { key: "realEstate", name: "부동산",     color: "#f2994a" },
            { key: "investment", name: "투자자산",   color: "#2f80ed" },
            { key: "cash",       name: "현금성자산", color: "#56ccf2" },
            { key: "etc",        name: "기타",       color: "#bb6bd9" }
        ],
        data: series
    });
}

function drawMonthlyIncreaseChart() {
    const container = document.getElementById("monthlyIncreaseChart");
    if (!container) return;

    container.innerHTML = "";

    if (analysisHistory.length < 2) {
        container.innerHTML = `<div class="analysis-empty">데이터가 부족합니다.</div>`;
        return;
    }

    const data = [];

    for (let i = 1; i < analysisHistory.length; i++) {
        const prev = getHistoryMetrics(analysisHistory[i - 1]);
        const cur = getHistoryMetrics(analysisHistory[i]);

        data.push({
            date: analysisHistory[i].date,
            value: cur.netWorth - prev.netWorth
        });
    }

    createBarChart(container, data);
}


/* ==================================================
   Line chart
================================================== */

function createLineChart(options) {
    const container = document.getElementById(options.containerId);
    if (!container) return;

    container.innerHTML = "";

    if (!options.data || options.data.length === 0) {
        container.innerHTML = `<div class="analysis-empty">데이터가 없습니다.</div>`;
        return;
    }

    const width = Math.max(container.clientWidth || 320, 280);
    const height = 250;

    const padding = { top: 22, right: 14, bottom: 34, left: 52 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    let maxValue = 0;

    options.data.forEach(point => {
        options.series.forEach(serie => {
            maxValue = Math.max(maxValue, Number(point[serie.key]) || 0);
        });
    });

    if (maxValue <= 0) maxValue = 100;
    maxValue *= 1.12;

    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    container.appendChild(svg);

    const tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";
    container.appendChild(tooltip);

    const gridCount = 4;

    for (let i = 0; i <= gridCount; i++) {
        const ratio = i / gridCount;
        const y = padding.top + chartHeight * ratio;

        const line = document.createElementNS(ns, "line");
        line.setAttribute("x1", padding.left);
        line.setAttribute("x2", width - padding.right);
        line.setAttribute("y1", y);
        line.setAttribute("y2", y);
        line.setAttribute("class", "chart-grid-line");
        svg.appendChild(line);

        const value = maxValue - maxValue * ratio;

        const text = document.createElementNS(ns, "text");
        text.setAttribute("x", padding.left - 7);
        text.setAttribute("y", y + 3);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("class", "chart-axis-text");
        text.textContent = formatChartAxis(value);
        svg.appendChild(text);
    }

    function getX(index) {
        if (options.data.length === 1) return padding.left + chartWidth / 2;
        return padding.left + (chartWidth * index / (options.data.length - 1));
    }

    function getY(value) {
        const ratio = (maxValue - value) / maxValue;
        return padding.top + chartHeight * ratio;
    }

    options.data.forEach((point, index) => {
        const shouldShow =
            options.data.length <= 6 ||
            index === 0 ||
            index === options.data.length - 1 ||
            index % Math.ceil(options.data.length / 5) === 0;

        if (!shouldShow) return;

        const text = document.createElementNS(ns, "text");
        text.setAttribute("x", getX(index));
        text.setAttribute("y", height - 10);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("class", "chart-axis-text");
        text.textContent = formatShortDate(point.date);

        svg.appendChild(text);
    });

    options.series.forEach(serie => {
        let pathData = "";

        options.data.forEach((point, index) => {
            const value = Number(point[serie.key]) || 0;
            const x = getX(index);
            const y = getY(value);

            if (index === 0) pathData += `M ${x} ${y}`;
            else pathData += ` L ${x} ${y}`;
        });

        const path = document.createElementNS(ns, "path");
        path.setAttribute("d", pathData);
        path.setAttribute("class", "chart-line");
        path.setAttribute("stroke", serie.color);
        svg.appendChild(path);

        options.data.forEach((point, index) => {
            const value = Number(point[serie.key]) || 0;
            const x = getX(index);
            const y = getY(value);

            const circle = document.createElementNS(ns, "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", 4.5);
            circle.setAttribute("fill", serie.color);
            circle.setAttribute("class", "chart-point");

            const hit = document.createElementNS(ns, "circle");
            hit.setAttribute("cx", x);
            hit.setAttribute("cy", y);
            hit.setAttribute("r", 16);
            hit.setAttribute("class", "chart-point-hit");

            hit.addEventListener("pointerdown", function (e) {
                e.preventDefault();
                e.stopPropagation();

                showChartTooltip(container, tooltip, point.date, serie.name, value, x, y);
            });

            svg.appendChild(circle);
            svg.appendChild(hit);
        });
    });

    container.addEventListener("pointerdown", function (e) {
        if (!e.target.classList.contains("chart-point-hit")) {
            tooltip.classList.remove("show");
        }
    });
}


/* ==================================================
   Bar chart
================================================== */

function createBarChart(container, data) {
    const width = Math.max(container.clientWidth || 320, 280);
    const height = 250;

    const padding = { top: 22, right: 14, bottom: 40, left: 52 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    let maxAbs = 0;
    data.forEach(d => {
        maxAbs = Math.max(maxAbs, Math.abs(d.value));
    });

    if (maxAbs <= 0) maxAbs = 100;
    maxAbs *= 1.1;

    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    container.appendChild(svg);

    const tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";
    container.appendChild(tooltip);

    const zeroY = padding.top + chartHeight / 2;

    const zeroLine = document.createElementNS(ns, "line");
    zeroLine.setAttribute("x1", padding.left);
    zeroLine.setAttribute("x2", width - padding.right);
    zeroLine.setAttribute("y1", zeroY);
    zeroLine.setAttribute("y2", zeroY);
    zeroLine.setAttribute("stroke", "#bbb");
    zeroLine.setAttribute("stroke-width", 1);
    zeroLine.setAttribute("stroke-dasharray", "3 3");
    svg.appendChild(zeroLine);

    const barGap = 4;
    const barWidth = Math.max(
        4,
        (chartWidth - barGap * (data.length - 1)) / data.length
    );

    data.forEach((point, index) => {
        const x = padding.left + index * (barWidth + barGap);
        const barH = (Math.abs(point.value) / maxAbs) * (chartHeight / 2);

        const y = point.value >= 0 ? zeroY - barH : zeroY;

        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", Math.max(1, barH));
        rect.setAttribute("rx", 3);
        rect.setAttribute("fill", point.value >= 0 ? "#eb5757" : "#2f80ed");
        svg.appendChild(rect);

        const shouldShow =
            data.length <= 6 ||
            index === 0 ||
            index === data.length - 1 ||
            index % Math.ceil(data.length / 5) === 0;

        if (shouldShow) {
            const text = document.createElementNS(ns, "text");
            text.setAttribute("x", x + barWidth / 2);
            text.setAttribute("y", height - 10);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("class", "chart-axis-text");
            text.textContent = formatShortDate(point.date);
            svg.appendChild(text);
        }

        const hit = document.createElementNS(ns, "rect");
        hit.setAttribute("x", x - 2);
        hit.setAttribute("y", padding.top);
        hit.setAttribute("width", barWidth + 4);
        hit.setAttribute("height", chartHeight);
        hit.setAttribute("fill", "transparent");
        hit.setAttribute("class", "chart-point-hit");

        hit.addEventListener("pointerdown", function (e) {
            e.preventDefault();
            e.stopPropagation();

            showChartTooltip(
                container, tooltip, point.date,
                "증가액", point.value,
                x + barWidth / 2,
                point.value >= 0 ? zeroY - barH : zeroY + barH
            );
        });

        svg.appendChild(hit);
    });

    container.addEventListener("pointerdown", function (e) {
        if (!e.target.classList.contains("chart-point-hit")) {
            tooltip.classList.remove("show");
        }
    });
}


/* ==================================================
   Tooltip / 포맷
================================================== */

function showChartTooltip(container, tooltip, date, seriesName, value, x, y) {
    const sign = value > 0 ? "+" : value < 0 ? "−" : "";
    const abs = Math.abs(value);

    tooltip.innerHTML = `
        <div class="chart-tooltip-date">${formatFullDate(date)}</div>
        <div class="chart-tooltip-value">
            ${escapeHtml(seriesName)} · ₩${sign}${formatNumber(abs)}
        </div>
    `;

    tooltip.classList.add("show");

    const svg = container.querySelector("svg");
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const vbW = svg.viewBox.baseVal.width || 320;
    const vbH = svg.viewBox.baseVal.height || 250;

    const scaleX = rect.width / vbW;
    const scaleY = rect.height / vbH;

    let left = x * scaleX;
    let top = y * scaleY - 58;

    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;

    if (left + tw > container.clientWidth - 5) left = container.clientWidth - tw - 5;
    if (left < 5) left = 5;
    if (top < 5) top = y * scaleY + 15;
    if (top + th > container.clientHeight) top = container.clientHeight - th - 5;

    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
}


function formatChartAxis(value) {
    const number = Number(value) || 0;
    const abs = Math.abs(number);
    const sign = number < 0 ? "−" : "";

    if (abs >= 100000000) {
        return sign + (abs / 100000000).toFixed(1).replace(/\.0$/, "") + "억";
    }

    if (abs >= 10000) {
        return sign + Math.round(abs / 10000) + "만";
    }

    return sign + Math.round(abs).toLocaleString("ko-KR");
}


function formatShortDate(date) {
    if (!date) return "";

    const parts = String(date).split("-");
    if (parts.length < 3) return date;

    return Number(parts[1]) + "/" + Number(parts[2]);
}


function formatFullDate(date) {
    if (!date) return "";
    return String(date).replaceAll("-", ".");
}


/* ==================================================
   Resize
================================================== */

window.addEventListener("resize", function () {
    const page = document.getElementById("analysisPage");

    if (page && page.classList.contains("active-page") && analysisLoaded) {
        renderAnalysis();
    }
});