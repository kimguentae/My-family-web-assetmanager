const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyRpEj16FbTROjdEuOsxCpo4oa64jt3tHNA844e4UFrv7mv3HP5u7JFgfOXHjfk-qFcjA/exec";


/* =========================
   저장
========================= */

async function saveToGoogleSheet(data) {

    try {

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(data)
                }
            );

        return await response.json();

    } catch (error) {

        console.error(
            "Google Sheets 저장 오류:",
            error
        );

        return {
            success: false,
            error: String(error)
        };

    }

}


/* =========================
   특정 날짜 불러오기
========================= */

async function loadFromGoogleSheet(date) {

    try {

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL +
                "?date=" +
                encodeURIComponent(date)
            );

        return await response.json();

    } catch (error) {

        console.error(
            "Google Sheets 불러오기 오류:",
            error
        );

        return {
            success: false,
            error: String(error)
        };

    }

}


/* =========================
   전체 날짜 기록 불러오기
========================= */

async function loadHistoryFromGoogleSheet() {

    try {

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL +
                "?action=history"
            );

        return await response.json();

    } catch (error) {

        console.error(
            "Google Sheets 분석 데이터 오류:",
            error
        );

        return {
            success: false,
            error: String(error)
        };

    }

}