/* ==================================================
   MY ASSET
================================================== */


/* ==================================================
   기본 항목
================================================== */

const DEFAULT_TREE = [

    {
        id: "asset_realestate",
        name: "부동산",
        type: "asset",

        children: [

            {
                id: "apt",
                name: "아파트",
                children: []
            }

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
   상태
================================================== */

let tree = loadTree();

let selectedDate =
    localStorage.getItem("myAssetSelectedDate") || getToday();


/* ==================================================
   시작
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        normalizeTree();

        updateDate();

        initNavigation();

        initDate();

        initSave();

        initNetWorthStack();

        renderInput();

        initAnalysis();

        await loadDateData();

    }
);


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

    if (!date) {
        return "";
    }

    return date.replaceAll("-", ".");

}


function updateDate() {

    const element = document.getElementById("selectedDate");

    if (element) {
        element.textContent = formatDate(selectedDate);
    }

}


function initDate() {

    const picker = document.getElementById("datePicker");

    if (!picker) {
        return;
    }

    picker.value = selectedDate;


    picker.addEventListener(
        "change",
        async function () {

            if (!this.value) {
                return;
            }

            selectedDate = this.value;

            localStorage.setItem("myAssetSelectedDate", selectedDate);

            updateDate();

            renderInput();

            await loadDateData();

        }
    );

}


/* ==================================================
   네비게이션
================================================== */

function initNavigation() {

    document.querySelectorAll(".nav-item")
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const page = this.dataset.page;


                        document.querySelectorAll(".page")
                            .forEach(p => p.classList.remove("active-page"));


                        const target = document.getElementById(page + "Page");

                        if (target) {
                            target.classList.add("active-page");
                        }


                        document.querySelectorAll(".nav-item")
                            .forEach(n => n.classList.remove("active"));


                        this.classList.add("active");


                        const title = document.getElementById("headerTitle");

                        if (title) {

                            title.textContent =
                                page === "input" ? "자산입력" : "MY ASSET";

                        }


                        if (page === "analysis") {
                            renderAnalysis();
                        }

                    }
                );

            }
        );

}


/* ==================================================
   홈 순자산 카드 스택 (가로 스와이프)
================================================== */

function initNetWorthStack() {

    const stack = document.getElementById("netWorthStack");
    const dots = document.getElementById("stackDots");

    if (!stack) {
        return;
    }


    stack.addEventListener(
        "scroll",
        function () {

            if (!dots) {
                return;
            }


            const index =
                Math.round(stack.scrollLeft / stack.clientWidth);


            dots.querySelectorAll(".dot")
                .forEach(
                    (dot, i) => {

                        dot.classList.toggle("active", i === index);

                    }
                );

        }
    );


    if (dots) {

        dots.querySelectorAll(".dot")
            .forEach(
                (dot, i) => {

                    dot.addEventListener(
                        "click",
                        function () {

                            stack.scrollTo({
                                left: stack.clientWidth * i,
                                behavior: "smooth"
                            });

                        }
                    );

                }
            );

    }

}


/* ==================================================
   저장
================================================== */

function initSave() {

    const button = document.getElementById("saveButton");

    if (!button) {
        return;
    }

    button.addEventListener("click", saveAll);

}


async function saveAll() {

    const button = document.getElementById("saveButton");
    const status = document.getElementById("saveStatus");

    if (!button) {
        return;
    }


    button.disabled = true;

    button.textContent = "저장 중...";


    if (status) {
        status.textContent = "";
    }


    const values = collectValues();


    localStorage.setItem(
        "myAssetValues_" + selectedDate,
        JSON.stringify(values)
    );


    saveTree();

    // 홈 데이터만 갱신 (입력탭은 다시 그리지 않음 → 접힘 상태 유지)
    updateHome();


    const data = {

        action: "save",

        baseDate: selectedDate,

        values: values,

        tree: tree

    };


    const result = await saveToGoogleSheet(data);


    if (result && result.success) {

        if (status) {
            status.textContent = "저장되었습니다.";
        }

    } else {

        if (status) {
            status.textContent = "저장에 실패했습니다.";
        }

    }


    button.disabled = false;

    button.textContent = "저장하기";

}


/* ==================================================
   입력값 수집
================================================== */

function collectValues() {

    const values = {};


    tree.forEach(
        root => {

            (root.children || [])
                .forEach(
                    middle => {

                        const middleInput =
                            document.getElementById("middle_value_" + middle.id);


                        if (middleInput) {

                            const raw = middleInput.dataset.rawValue;

                            if (raw !== undefined && raw !== "") {
                                values[middle.id] = Number(raw) || 0;
                            }

                        }


                        (middle.children || [])
                            .forEach(
                                child => {

                                    const input =
                                        document.getElementById("value_" + child.id);

                                    if (!input) {
                                        return;
                                    }


                                    const raw = input.dataset.rawValue;


                                    if (raw !== undefined && raw !== "") {
                                        values[child.id] = Number(raw) || 0;
                                    } else {
                                        values[child.id] = 0;
                                    }

                                }
                            );

                    }
                );

        }
    );


    return values;

}


/* ==================================================
   INPUT RENDER
================================================== */

function renderInput() {

    const container = document.getElementById("inputTree");

    if (!container) {
        return;
    }


    container.innerHTML = "";


    createInputSection("asset", "자산", container);
    createInputSection("debt", "부채", container);

}


/* ==================================================
   자산 / 부채 영역
================================================== */

function createInputSection(type, name, container) {

    const roots = tree.filter(item => item.type === type);


    const card = document.createElement("div");

    card.className = "input-tree-card";


    const header = document.createElement("div");

    header.className = "input-section-header";


    header.innerHTML = `

        <div class="input-section-left">

            <div class="input-section-icon ${type === "debt" ? "debt" : ""}">

                ${type === "debt" ? "−" : "+"}

            </div>

            <span>${escapeHtml(name)}</span>

        </div>


        <div class="input-section-arrow">›</div>

    `;


    const list = document.createElement("div");

    list.className = "input-section-list";


    header.addEventListener(
        "click",
        function () {

            header.classList.toggle("open");
            list.classList.toggle("open");

        }
    );


    roots.forEach(
        root => {

            list.appendChild(createRootElement(root));

        }
    );


    card.appendChild(header);
    card.appendChild(list);
    container.appendChild(card);

}


/* ==================================================
   대분류 (스와이프 → 추가 액션)
================================================== */

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


    const actions = createSwipeActions(
        [
            {
                label: "추가",
                cls: "add",
                onClick: () => addMiddle(root.id)
            }
        ]
    );


    swiper.appendChild(actions);
    swiper.appendChild(header);


    attachSwipe(swiper, header, actions);


    const middleList = document.createElement("div");

    middleList.className = "middle-list";


    header.addEventListener(
        "click",
        function () {

            if (header.dataset.swiped === "1") {
                header.dataset.swiped = "0";
                return;
            }

            header.classList.toggle("open");
            middleList.classList.toggle("open");

        }
    );


    (root.children || [])
        .forEach(
            middle => {

                middleList.appendChild(createMiddleElement(middle));

            }
        );


    block.appendChild(swiper);
    block.appendChild(middleList);

    return block;

}


/* ==================================================
   중분류 (스와이프 → 수정 / 삭제 / 추가)
================================================== */

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


    const actions = createSwipeActions(
        [
            {
                label: "수정",
                cls: "edit",
                onClick: () => editMiddle(middle.id)
            },
            {
                label: "삭제",
                cls: "delete",
                onClick: () => deleteMiddle(middle.id)
            },
            {
                label: "추가",
                cls: "add",
                onClick: () => addChild(middle.id)
            }
        ]
    );


    swiper.appendChild(actions);
    swiper.appendChild(header);


    attachSwipe(swiper, header, actions);


    const childList = document.createElement("div");

    childList.className = "child-list";


    header.addEventListener(
        "click",
        function (e) {

            if (e.target.closest("input")) {
                return;
            }


            if (header.dataset.swiped === "1") {
                header.dataset.swiped = "0";
                return;
            }


            header.classList.toggle("open");
            childList.classList.toggle("open");

        }
    );


    const middleInput =
        header.querySelector("#middle_value_" + middle.id);


    if (directValue !== null) {

        middleInput.dataset.rawValue = directValue;

        middleInput.value = formatNumber(directValue);

    } else {

        middleInput.dataset.rawValue = "";

    }


    attachMoneyInput(middleInput, middle, "middle");


    (middle.children || [])
        .forEach(
            child => {

                childList.appendChild(createChildElement(child));

            }
        );


    block.appendChild(swiper);
    block.appendChild(childList);

    return block;

}


/* ==================================================
   소분류 (스와이프 → 수정 / 삭제)
================================================== */

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


    const actions = createSwipeActions(
        [
            {
                label: "수정",
                cls: "edit",
                onClick: () => editChild(child.id)
            },
            {
                label: "삭제",
                cls: "delete",
                onClick: () => deleteChild(child.id)
            }
        ]
    );


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


    input.addEventListener(
        "pointerdown",
        function (e) {
            e.stopPropagation();
        }
    );


    return swiper;

}


/* ==================================================
   스와이프 액션 버튼 생성
================================================== */

function createSwipeActions(items) {

    const wrap = document.createElement("div");

    wrap.className = "swipe-actions";


    items.forEach(
        item => {

            const btn = document.createElement("button");

            btn.type = "button";

            btn.className = "swipe-action-btn " + item.cls;

            btn.textContent = item.label;


            btn.addEventListener(
                "click",
                function (e) {

                    e.stopPropagation();

                    closeAllSwipes();

                    item.onClick();

                }
            );


            wrap.appendChild(btn);

        }
    );


    return wrap;

}


/* ==================================================
   스와이프 제스처
================================================== */

function closeAllSwipes(except) {

    document.querySelectorAll(".swipe-content.swiped")
        .forEach(
            el => {

                if (el === except) {
                    return;
                }

                el.classList.remove("swiped");
                el.style.transform = "";
                el.dataset.swiped = "0";

            }
        );

}


function attachSwipe(wrapper, content, actions) {

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let dragging = false;
    let decided = false;
    let isHorizontal = false;


    function getActionsWidth() {

        const w = actions.offsetWidth;

        if (w > 0) {
            return w;
        }

        return actions.children.length * 62;

    }


    function onStart(e) {

        if (e.target.closest("input")) {
            return;
        }


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

        if (!dragging) {
            return;
        }


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


        if (!isHorizontal) {
            return;
        }


        if (e.cancelable) {
            e.preventDefault();
        }


        const actionsWidth = getActionsWidth();


        const base =
            content.classList.contains("swiped")
                ? -actionsWidth
                : 0;


        let offset = base + dx;


        if (offset > 0) {
            offset = 0;
        }

        if (offset < -actionsWidth) {
            offset = -actionsWidth;
        }


        currentX = offset;

        content.style.transform = `translateX(${offset}px)`;

    }


    function onEnd() {

        if (!dragging) {
            return;
        }

        dragging = false;


        content.style.transition = "transform .22s ease";


        const actionsWidth = getActionsWidth();


        const shouldOpen =
            isHorizontal &&
            currentX < -actionsWidth / 2;


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


    // 데스크탑 마우스 지원
    content.addEventListener("mousedown", onStart);
    content.addEventListener("mousemove", onMove);
    content.addEventListener("mouseup", onEnd);
    content.addEventListener("mouseleave", onEnd);

}


/* ==================================================
   금액 입력 처리
================================================== */

function attachMoneyInput(input, item, kind) {

    if (!input) {
        return;
    }


    input.addEventListener(
        "focus",
        function () {
            this.select();
        }
    );


    input.addEventListener(
        "input",
        function () {

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

        }
    );


    input.addEventListener(
        "keydown",
        function (e) {

            if (e.key === "Enter") {

                e.preventDefault();

                this.blur();

            }

        }
    );


    input.addEventListener(
        "blur",
        function () {

            const raw = this.dataset.rawValue;


            if (raw === undefined || raw === "") {

                this.value = "";
                return;

            }


            this.value = formatNumber(raw);

            updateTotalsRealtime();

        }
    );

}


/* ==================================================
   실시간 합계 업데이트
================================================== */

function updateTotalsRealtime() {

    const values = collectValues();


    localStorage.setItem(
        "myAssetValues_" + selectedDate,
        JSON.stringify(values)
    );


    tree.forEach(
        root => {

            (root.children || [])
                .forEach(
                    middle => {

                        const input =
                            document.getElementById("middle_value_" + middle.id);

                        const total = getMiddleTotal(middle);


                        if (
                            input &&
                            (
                                input.dataset.rawValue === undefined ||
                                input.dataset.rawValue === ""
                            )
                        ) {

                            input.placeholder = formatNumber(total);

                        }


                        updateRootTotal(root);

                    }
                );

        }
    );


    updateHome();

}


/* ==================================================
   중분류 직접 입력값
================================================== */

function getMiddleDirectValue(middle) {

    const values = getLocalValues();


    if (Object.prototype.hasOwnProperty.call(values, middle.id)) {
        return Number(values[middle.id]) || 0;
    }


    return null;

}


/* ==================================================
   중분류 합계
================================================== */

function getMiddleTotal(middle) {

    const values = getLocalValues();


    if (Object.prototype.hasOwnProperty.call(values, middle.id)) {
        return Number(values[middle.id]) || 0;
    }


    let total = 0;


    (middle.children || [])
        .forEach(
            child => {

                total += Number(values[child.id] || 0);

            }
        );


    return total;

}


/* ==================================================
   대분류 합계
================================================== */

function getRootTotal(root) {

    let total = 0;


    (root.children || [])
        .forEach(
            middle => {

                total += getMiddleTotal(middle);

            }
        );


    return total;

}


/* ==================================================
   대분류 화면 금액 갱신
================================================== */

function updateRootTotal(root) {

    const element = document.getElementById("root_total_" + root.id);

    if (!element) {
        return;
    }


    const total = getRootTotal(root);


    element.textContent =
        getCurrencySymbolForRoot(root) + formatNumber(total);

}


/* ==================================================
   통화
================================================== */

function getCurrencySymbolForRoot(root) {
    return "₩";
}


function getCurrencySymbolForMiddle(middle) {

    const children = middle.children || [];


    const hasUSD = children.some(child => child.currency === "USD");
    const hasKRW = children.some(child => child.currency !== "USD");


    if (hasUSD && !hasKRW) {
        return "$";
    }


    return "₩";

}


/* ==================================================
   날짜 데이터 로딩 상태
================================================== */

function setLoadStatus(status) {

    const element = document.getElementById("loadStatus");

    if (!element) {
        return;
    }


    element.className = "load-status";


    if (status === "loading") {
        element.classList.add("loading");
    } else if (status === "success") {
        element.classList.add("success");
    } else if (status === "error") {
        element.classList.add("error");
    }

}


/* ==================================================
   추가 / 수정 / 삭제
================================================== */

function addRoot(type) {

    const name = prompt("추가할 대분류 이름");

    if (!name || !name.trim()) {
        return;
    }


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

    if (!root) {
        return;
    }


    const name = prompt(`"${root.name}" 아래에 추가할 중분류`);

    if (!name || !name.trim()) {
        return;
    }


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

    if (!middle) {
        return;
    }


    const name = prompt(`"${middle.name}" 아래에 추가할 소분류`);

    if (!name || !name.trim()) {
        return;
    }


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


function editRoot(id) {

    const root = findRoot(id);

    if (!root) {
        return;
    }


    const name = prompt("대분류 이름 수정", root.name);

    if (!name || !name.trim()) {
        return;
    }


    root.name = name.trim();

    saveTree();
    renderInput();
    updateHome();

}


function editMiddle(id) {

    const middle = findMiddle(id);

    if (!middle) {
        return;
    }


    const name = prompt("중분류 이름 수정", middle.name);

    if (!name || !name.trim()) {
        return;
    }


    middle.name = name.trim();

    saveTree();
    renderInput();
    updateHome();

}


function editChild(id) {

    const result = findChild(id);

    if (!result) {
        return;
    }


    const child = result.child;


    const name = prompt("소분류 이름 수정", child.name);

    if (!name || !name.trim()) {
        return;
    }


    child.name = name.trim();

    saveTree();
    renderInput();
    updateHome();

}


function deleteRoot(id) {

    const root = findRoot(id);

    if (!root) {
        return;
    }


    const ids = getAllIdsFromRoot(root);

    const values = getLocalValues();


    const hasValue = ids.some(id => Number(values[id] || 0) !== 0);


    let message = `"${root.name}"을 삭제할까요?`;


    if (hasValue) {
        message += "\n\n입력된 금액도 함께 사라집니다.";
    }


    if (!confirm(message)) {
        return;
    }


    tree = tree.filter(item => item.id !== id);


    removeValues(ids);

    saveTree();
    renderInput();
    updateHome();

}


function deleteMiddle(id) {

    const result = findMiddleWithRoot(id);

    if (!result) {
        return;
    }


    const middle = result.middle;


    const ids = [
        middle.id,
        ...(middle.children || []).map(child => child.id)
    ];


    if (!confirm(`"${middle.name}"을 삭제할까요?`)) {
        return;
    }


    result.root.children =
        (result.root.children || []).filter(item => item.id !== id);


    removeValues(ids);

    saveTree();
    renderInput();
    updateHome();

}


function deleteChild(id) {

    const result = findChild(id);

    if (!result) {
        return;
    }


    if (!confirm(`"${result.child.name}"을 삭제할까요?`)) {
        return;
    }


    result.middle.children =
        (result.middle.children || []).filter(child => child.id !== id);


    removeValues([id]);

    saveTree();
    renderInput();
    updateHome();

}


/* ==================================================
   값 삭제
================================================== */

function removeValues(ids) {

    const values = getLocalValues();


    ids.forEach(id => {
        delete values[id];
    });


    localStorage.setItem(
        "myAssetValues_" + selectedDate,
        JSON.stringify(values)
    );

}


/* ==================================================
   찾기
================================================== */

function findRoot(id) {

    return tree.find(item => item.id === id);

}


function findMiddle(id) {

    for (const root of tree) {

        const middle =
            (root.children || []).find(item => item.id === id);

        if (middle) {
            return middle;
        }

    }


    return null;

}


function findMiddleWithRoot(id) {

    for (const root of tree) {

        const middle =
            (root.children || []).find(item => item.id === id);

        if (middle) {
            return { root, middle };
        }

    }


    return null;

}


function findChild(id) {

    for (const root of tree) {

        for (const middle of (root.children || [])) {

            const child =
                (middle.children || []).find(item => item.id === id);

            if (child) {
                return { root, middle, child };
            }

        }

    }


    return null;

}


/* ==================================================
   ID
================================================== */

function makeId() {

    return (
        "custom_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 8)
    );

}


/* ==================================================
   HOME
================================================== */

function updateHome() {

    const values = getLocalValues();


    let assetTotal = 0;
    let debtTotal = 0;
    let realEstateTotal = 0;


    tree.forEach(
        root => {

            const total = getRootTotal(root);


            if (root.type === "debt") {

                debtTotal += total;

            } else {

                assetTotal += total;


                if (root.id === "asset_realestate") {
                    realEstateTotal += total;
                }

            }

        }
    );


    const netWorthExcludingRealEstate =
        assetTotal - realEstateTotal - debtTotal;


    const assetElement = document.getElementById("assetTotal");
    const debtElement = document.getElementById("debtTotal");
    const netElement = document.getElementById("netWorth");
    const netExcludingRealEstateElement =
        document.getElementById("netWorthExcludingRealEstate");


    if (assetElement) {
        assetElement.textContent = formatNumber(assetTotal);
    }

    if (debtElement) {
        debtElement.textContent = formatNumber(debtTotal);
    }

    if (netElement) {
        netElement.textContent = formatNumber(assetTotal - debtTotal);
    }

    if (netExcludingRealEstateElement) {
        netExcludingRealEstateElement.textContent =
            formatNumber(netWorthExcludingRealEstate);
    }


    renderHome(
        tree.filter(x => x.type === "asset"),
        "homeAssets",
        values,
        false
    );


    renderHome(
        tree.filter(x => x.type === "debt"),
        "homeDebts",
        values,
        true
    );

}


/* ==================================================
   HOME RENDER (기본 접힘)
================================================== */

function renderHome(roots, containerId, values, isDebt) {

    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }


    container.innerHTML = "";


    roots.forEach(
        root => {

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

            // 기본 접힘


            header.addEventListener(
                "click",
                function () {

                    header.classList.toggle("open");
                    list.classList.toggle("open");

                }
            );


            (root.children || [])
                .forEach(
                    middle => {

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


                        middleHeader.addEventListener(
                            "click",
                            function (e) {

                                e.stopPropagation();

                                middleHeader.classList.toggle("open");
                                children.classList.toggle("open");

                            }
                        );


                        (middle.children || [])
                            .forEach(
                                child => {

                                    const row = document.createElement("div");

                                    row.className = "subcategory-row";


                                    const currency =
                                        child.currency === "USD" ? "$" : "₩";


                                    row.innerHTML = `

                                        <span>${escapeHtml(child.name)}</span>

                                        <span>${currency}${formatNumber(
                                            values[child.id] || 0
                                        )}</span>

                                    `;


                                    children.appendChild(row);

                                }
                            );


                        middleBlock.appendChild(middleHeader);
                        middleBlock.appendChild(children);


                        list.appendChild(middleBlock);

                    }
                );


            item.appendChild(header);
            item.appendChild(list);


            container.appendChild(item);

        }
    );

}


/* ==================================================
   GOOGLE SHEETS
================================================== */

async function loadDateData() {

    setLoadStatus("loading");


    const local = getLocalValues();

    if (local) {
        updateHome();
    }


    try {

        let result = await loadFromGoogleSheet(selectedDate);


        const hasData =
            result &&
            result.success &&
            result.data &&
            result.data.values &&
            Object.keys(result.data.values).length > 0;


        if (!hasData) {

            const historyResult = await loadHistoryFromGoogleSheet();


            if (
                historyResult &&
                historyResult.success &&
                Array.isArray(historyResult.data) &&
                historyResult.data.length > 0
            ) {

                const sortedHistory =
                    historyResult.data
                        .filter(
                            item =>
                                item &&
                                item.date &&
                                item.date < selectedDate
                        )
                        .sort(
                            (a, b) =>
                                String(b.date).localeCompare(String(a.date))
                        );


                if (sortedHistory.length > 0) {

                    const mostRecentRecord = sortedHistory[0];


                    result = {
                        success: true,
                        data: {
                            tree: mostRecentRecord.tree,
                            values: mostRecentRecord.values
                        }
                    };

                }

            }

        }


        if (result && result.success && result.data) {

            if (
                result.data.tree &&
                Array.isArray(result.data.tree) &&
                result.data.tree.length
            ) {

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

            console.error("날짜 데이터 불러오기 실패:", result);

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
   TREE NORMALIZE
================================================== */

function normalizeTree() {

    tree.forEach(
        root => {

            root.children = root.children || [];

            root.children.forEach(
                middle => {
                    middle.children = middle.children || [];
                }
            );

        }
    );

}


/* ==================================================
   LOCAL STORAGE
================================================== */

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

        const stored =
            JSON.parse(localStorage.getItem("myAssetTree") || "null");


        if (Array.isArray(stored) && stored.length > 0) {
            return stored;
        }

    } catch (e) {
        // ignore
    }


    return JSON.parse(JSON.stringify(DEFAULT_TREE));

}


function saveTree() {

    localStorage.setItem("myAssetTree", JSON.stringify(tree));

}


/* ==================================================
   전체 ID
================================================== */

function getAllIdsFromRoot(root) {

    const ids = [];

    ids.push(root.id);


    (root.children || [])
        .forEach(
            middle => {

                ids.push(middle.id);


                (middle.children || [])
                    .forEach(
                        child => {
                            ids.push(child.id);
                        }
                    );

            }
        );


    return ids;

}


/* ==================================================
   숫자
================================================== */

function formatNumber(number) {

    return Math.round(Number(number) || 0).toLocaleString("ko-KR");

}


/* ==================================================
   HTML 안전처리
================================================== */

function escapeHtml(value) {

    return String(value).replace(
        /[&<>"']/g,
        function (char) {

            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];

        }
    );

}


/* ==================================================
   ANALYSIS
================================================== */

let analysisHistory = [];
let analysisLoaded = false;


function initAnalysis() {}


async function renderAnalysis() {

    const containers = [
        document.getElementById("netWorthChart"),
        document.getElementById("assetDebtChart"),
        document.getElementById("investmentChart")
    ];


    if (containers.every(x => !x)) {
        return;
    }


    containers.forEach(
        container => {

            if (container) {

                container.innerHTML =
                    `<div class="analysis-empty">
                        분석 데이터를 불러오는 중...
                    </div>`;

            }

        }
    );


    try {

        const result = await loadHistoryFromGoogleSheet();


        if (!result || !result.success || !Array.isArray(result.data)) {

            showAnalysisEmpty("분석 데이터를 불러오지 못했습니다.");
            return;

        }


        analysisHistory =
            result.data
                .filter(item => item && item.date)
                .sort(
                    (a, b) =>
                        String(a.date).localeCompare(String(b.date))
                );


        analysisLoaded = true;


        if (analysisHistory.length === 0) {

            showAnalysisEmpty("저장된 날짜 데이터가 없습니다.");
            return;

        }


        drawNetWorthChart();
        drawAssetDebtChart();
        drawInvestmentChart();

    } catch (error) {

        console.error("분석 데이터 오류:", error);

        showAnalysisEmpty("분석 데이터를 불러오지 못했습니다.");

    }

}


function showAnalysisEmpty(message) {

    ["netWorthChart", "assetDebtChart", "investmentChart"]
        .forEach(
            id => {

                const container = document.getElementById(id);

                if (container) {

                    container.innerHTML =
                        `<div class="analysis-empty">
                            ${escapeHtml(message)}
                        </div>`;

                }

            }
        );

}


/* ==================================================
   기록 한 건의 값 계산
================================================== */

function getHistoryMetrics(record) {

    const values = record.values || {};

    const historyTree = Array.isArray(record.tree) ? record.tree : [];


    let totalAsset = 0;
    let totalDebt = 0;
    let realEstate = 0;
    let stocks = 0;
    let coin = 0;


    historyTree.forEach(
        root => {

            const rootTotal = getHistoryRootTotal(root, values);


            if (root.type === "debt") {
                totalDebt += rootTotal;
                return;
            }


            totalAsset += rootTotal;


            if (root.id === "asset_realestate") {
                realEstate += rootTotal;
            }


            if (root.id === "asset_investment") {

                (root.children || [])
                    .forEach(
                        middle => {

                            const value = getHistoryMiddleTotal(middle, values);


                            if (
                                middle.id === "koreaStock" ||
                                middle.id === "usStock"
                            ) {
                                stocks += value;
                            }


                            if (middle.id === "coin") {
                                coin += value;
                            }

                        }
                    );

            }

        }
    );


    return {

        asset: totalAsset,
        debt: totalDebt,
        netWorth: totalAsset - totalDebt,
        assetExcludingRealEstate: totalAsset - realEstate,
        stocks: stocks,
        coin: coin,
        realEstate: realEstate

    };

}


function getHistoryRootTotal(root, values) {

    let total = 0;


    (root.children || [])
        .forEach(
            middle => {
                total += getHistoryMiddleTotal(middle, values);
            }
        );


    return total;

}


function getHistoryMiddleTotal(middle, values) {

    if (Object.prototype.hasOwnProperty.call(values, middle.id)) {
        return Number(values[middle.id]) || 0;
    }


    let total = 0;


    (middle.children || [])
        .forEach(
            child => {
                total += Number(values[child.id] || 0);
            }
        );


    return total;

}


function getAnalysisSeries(metricNames) {

    return analysisHistory.map(
        record => {

            const metrics = getHistoryMetrics(record);

            const result = { date: record.date };


            metricNames.forEach(
                name => {
                    result[name] = Number(metrics[name]) || 0;
                }
            );


            return result;

        }
    );

}


/* ==================================================
   그래프 1
================================================== */

function drawNetWorthChart() {

    const series = getAnalysisSeries(["netWorth"]);


    createLineChart({

        containerId: "netWorthChart",

        series: [
            { key: "netWorth", name: "순자산", color: "#171717" }
        ],

        data: series

    });

}


/* ==================================================
   그래프 2
================================================== */

function drawAssetDebtChart() {

    const series =
        getAnalysisSeries(["assetExcludingRealEstate", "debt"]);


    createLineChart({

        containerId: "assetDebtChart",

        series: [
            {
                key: "assetExcludingRealEstate",
                name: "자산(부동산 제외)",
                color: "#2f80ed"
            },
            {
                key: "debt",
                name: "부채",
                color: "#eb5757"
            }
        ],

        data: series

    });

}


/* ==================================================
   그래프 3
================================================== */

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


/* ==================================================
   SVG LINE CHART
================================================== */

function createLineChart(options) {

    const container = document.getElementById(options.containerId);

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!options.data || options.data.length === 0) {

        container.innerHTML =
            `<div class="analysis-empty">데이터가 없습니다.</div>`;

        return;

    }


    const width = Math.max(container.clientWidth || 320, 280);
    const height = 250;


    const padding = { top: 22, right: 14, bottom: 34, left: 52 };


    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;


    let maxValue = 0;


    options.data.forEach(
        point => {

            options.series.forEach(
                serie => {

                    maxValue =
                        Math.max(maxValue, Number(point[serie.key]) || 0);

                }
            );

        }
    );


    if (maxValue <= 0) {
        maxValue = 100;
    }


    maxValue *= 1.12;


    const minValue = 0;


    const svg =
        document.createElementNS("http://www.w3.org/2000/svg", "svg");


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


        const line =
            document.createElementNS("http://www.w3.org/2000/svg", "line");

        line.setAttribute("x1", padding.left);
        line.setAttribute("x2", width - padding.right);
        line.setAttribute("y1", y);
        line.setAttribute("y2", y);
        line.setAttribute("class", "chart-grid-line");

        svg.appendChild(line);


        const value = maxValue - (maxValue - minValue) * ratio;


        const text =
            document.createElementNS("http://www.w3.org/2000/svg", "text");

        text.setAttribute("x", padding.left - 7);
        text.setAttribute("y", y + 3);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("class", "chart-axis-text");
        text.textContent = formatChartAxis(value);

        svg.appendChild(text);

    }


    function getX(index) {

        if (options.data.length === 1) {
            return padding.left + chartWidth / 2;
        }

        return padding.left + (chartWidth * index / (options.data.length - 1));

    }


    function getY(value) {

        const ratio = (maxValue - value) / (maxValue - minValue);

        return padding.top + chartHeight * ratio;

    }


    options.data.forEach(
        (point, index) => {

            const shouldShow =
                options.data.length <= 6 ||
                index === 0 ||
                index === options.data.length - 1 ||
                index % Math.ceil(options.data.length / 5) === 0;


            if (!shouldShow) {
                return;
            }


            const text =
                document.createElementNS("http://www.w3.org/2000/svg", "text");

            text.setAttribute("x", getX(index));
            text.setAttribute("y", height - 10);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("class", "chart-axis-text");
            text.textContent = formatShortDate(point.date);

            svg.appendChild(text);

        }
    );


    options.series.forEach(
        serie => {

            let pathData = "";


            options.data.forEach(
                (point, index) => {

                    const value = Number(point[serie.key]) || 0;
                    const x = getX(index);
                    const y = getY(value);


                    if (index === 0) {
                        pathData += `M ${x} ${y}`;
                    } else {
                        pathData += ` L ${x} ${y}`;
                    }

                }
            );


            const path =
                document.createElementNS("http://www.w3.org/2000/svg", "path");

            path.setAttribute("d", pathData);
            path.setAttribute("class", "chart-line");
            path.setAttribute("stroke", serie.color);

            svg.appendChild(path);


            options.data.forEach(
                (point, index) => {

                    const value = Number(point[serie.key]) || 0;
                    const x = getX(index);
                    const y = getY(value);


                    const circle =
                        document.createElementNS("http://www.w3.org/2000/svg", "circle");

                    circle.setAttribute("cx", x);
                    circle.setAttribute("cy", y);
                    circle.setAttribute("r", 4.5);
                    circle.setAttribute("fill", serie.color);
                    circle.setAttribute("class", "chart-point");


                    const hit =
                        document.createElementNS("http://www.w3.org/2000/svg", "circle");

                    hit.setAttribute("cx", x);
                    hit.setAttribute("cy", y);
                    hit.setAttribute("r", 16);
                    hit.setAttribute("class", "chart-point-hit");


                    hit.addEventListener(
                        "pointerdown",
                        function (e) {

                            e.preventDefault();
                            e.stopPropagation();


                            showChartTooltip(
                                container,
                                tooltip,
                                point.date,
                                serie.name,
                                value,
                                x,
                                y
                            );

                        }
                    );


                    svg.appendChild(circle);
                    svg.appendChild(hit);

                }
            );

        }
    );


    container.addEventListener(
        "pointerdown",
        function (e) {

            if (!e.target.classList.contains("chart-point-hit")) {
                tooltip.classList.remove("show");
            }

        }
    );

}


/* ==================================================
   그래프 Tooltip
================================================== */

function showChartTooltip(
    container,
    tooltip,
    date,
    seriesName,
    value,
    x,
    y
) {

    tooltip.innerHTML = `

        <div class="chart-tooltip-date">
            ${formatFullDate(date)}
        </div>

        <div class="chart-tooltip-value">
            ${escapeHtml(seriesName)}
            · ₩${formatNumber(value)}
        </div>

    `;


    tooltip.classList.add("show");


    const svg = container.querySelector("svg");

    if (!svg) {
        return;
    }


    const rect = svg.getBoundingClientRect();

    const viewBoxWidth = svg.viewBox.baseVal.width || 320;
    const viewBoxHeight = svg.viewBox.baseVal.height || 250;

    const scaleX = rect.width / viewBoxWidth;
    const scaleY = rect.height / viewBoxHeight;


    let left = x * scaleX;
    let top = y * scaleY - 58;


    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;


    if (left + tooltipWidth > container.clientWidth - 5) {
        left = container.clientWidth - tooltipWidth - 5;
    }

    if (left < 5) {
        left = 5;
    }

    if (top < 5) {
        top = y * scaleY + 15;
    }

    if (top + tooltipHeight > container.clientHeight) {
        top = container.clientHeight - tooltipHeight - 5;
    }


    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";

}


/* ==================================================
   그래프 숫자 표시
================================================== */

function formatChartAxis(value) {

    const number = Number(value) || 0;


    if (Math.abs(number) >= 100000000) {

        return (
            (number / 100000000).toFixed(1).replace(/\.0$/, "") + "억"
        );

    }


    if (Math.abs(number) >= 10000) {
        return Math.round(number / 10000) + "만";
    }


    return Math.round(number).toLocaleString("ko-KR");

}


/* ==================================================
   그래프 날짜
================================================== */

function formatShortDate(date) {

    if (!date) {
        return "";
    }


    const parts = String(date).split("-");


    if (parts.length < 3) {
        return date;
    }


    return Number(parts[1]) + "/" + Number(parts[2]);

}


function formatFullDate(date) {

    if (!date) {
        return "";
    }

    return String(date).replaceAll("-", ".");

}


/* ==================================================
   분석 화면 리사이즈
================================================== */

window.addEventListener(
    "resize",
    function () {

        const page = document.getElementById("analysisPage");


        if (
            page &&
            page.classList.contains("active-page") &&
            analysisLoaded
        ) {

            drawNetWorthChart();
            drawAssetDebtChart();
            drawInvestmentChart();

        }

    }
);