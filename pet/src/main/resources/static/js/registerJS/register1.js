document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".Big-form");
    const nextBtn = document.querySelector(".NEXT");
    let emailChecked = false;
    let phoneChecked = false;

    // ✅ 중복검사 fetch 로직 통합
    function checkDuplicate(type, value, callback) {
        let url = "";
        if (type === "email") {
            url = "/user/check-email?email=" + encodeURIComponent(value);
        } else if (type === "phone") {
            url = "/user/check-phone?phone=" + encodeURIComponent(value);
        } else {
            console.error("Invalid type for duplicate check:", type);
            return;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                callback(!data.exists);
                validateForm();
            })
            .catch(error => {
                console.error(`${type} 중복 확인 오류:`, error);
                alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
            });
    }

    // ✅ 유효성 + 중복확인 결과 통합 검사
    function validateForm() {
        const name = document.getElementById("name").value.trim();
        const gender = document.getElementById("gender").value;
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const passwordCheck = document.getElementById("passwordCheck").value;
        const phone = document.getElementById("tel").value.trim();
        const sido = document.getElementById("sido").value;

        const allFilled = name && gender && email && password && passwordCheck && phone && sido;
        const pwdMatch = password === passwordCheck;

        if (allFilled && pwdMatch && emailChecked && phoneChecked) {
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }
    }

    // ✅ 입력값 변화 → validateForm 호출
    document.querySelectorAll("input, select").forEach(input => {
        input.addEventListener("input", validateForm);
        input.addEventListener("change", validateForm);
    });

    // ✅ 이메일 중복 확인 버튼
    document.getElementById("emailCheck").addEventListener("click", () => {
        const email = document.getElementById("email").value.trim();
        if (!email) {
            alert("이메일을 입력해주세요.");
            return;
        }
        checkDuplicate("email", email, (result) => {
            emailChecked = result;
        });
    });

    // ✅ 전화번호 중복 확인 버튼
    document.getElementById("telCheck").addEventListener("click", () => {
        const phone = document.getElementById("tel").value.trim();
        if (!phone) {
            alert("휴대전화번호를 입력해주세요.");
            return;
        }
        checkDuplicate("phone", phone, (result) => {
            phoneChecked = result;
        });
    });

    // ✅ 폼 제출 전 최종 검증
    form.addEventListener("submit", (e) => {
        const name = document.getElementById("name").value.trim();
        const gender = document.getElementById("gender").value;
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const passwordCheck = document.getElementById("passwordCheck").value;
        const phone = document.getElementById("tel").value.trim();
        const sido = document.getElementById("sido").value;

        if (!name || !gender || !email || !password || !passwordCheck || !phone || !sido) {
            alert("모든 항목을 입력해주세요!");
            e.preventDefault();
            return;
        }

        if (password !== passwordCheck) {
            alert("비밀번호가 일치하지 않습니다!");
            e.preventDefault();
            return;
        }

        if (!emailChecked) {
            alert("이메일 중복 확인을 완료해주세요.");
            e.preventDefault();
            return;
        }

        if (!phoneChecked) {
            alert("휴대전화 중복 확인을 완료해주세요.");
            e.preventDefault();
            return;
        }
    });

    // ✅ 주소 선택 드롭다운 (jQuery)
    const $sido = $("#sido"),
        $sigungu = $("#sigungu"),
        $dong = $("#dong");

    fetch("/api/regions/sido")
        .then(res => res.json())
        .then(list => list.forEach(r => {
            $sido.append(new Option(r.name, r.code));
        }));

    $sido.on("change", () => {
        const code = $sido.val();
        $sigungu.prop("disabled", !code)
            .empty().append("<option value=''>— 선택 —</option>");
        $dong.prop("disabled", true)
            .empty().append("<option value=''>— 선택 —</option>");
        if (!code) return;

        fetch(`/api/regions/sigungu?code=${encodeURIComponent(code)}`)
            .then(res => res.json())
            .then(list => list.forEach(r => {
                $sigungu.append(new Option(r.name, r.code));
            }));
    });

    $sigungu.on("change", () => {
        const code = $sigungu.val();
        $dong.prop("disabled", !code)
            .empty().append("<option value=''>— 선택 —</option>");
        if (!code) return;

        fetch(`/api/regions/dong?code=${encodeURIComponent(code)}`)
            .then(res => res.json())
            .then(list => list.forEach(r => {
                $dong.append(new Option(r.name, r.code));
            }));
    });
});
