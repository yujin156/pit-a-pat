document.addEventListener("DOMContentLoaded", () => {
    // ✅ 이메일/전화번호 중복 확인 버튼 로직은 그대로 유지
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
            })
            .catch(error => {
                console.error(`${type} 중복 확인 오류:`, error);
                alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
            });
    }

    // ✅ 이메일 중복 확인 버튼
    document.getElementById("emailCheck").addEventListener("click", () => {
        const email = document.getElementById("email").value.trim();
        if (!email) {
            alert("이메일을 입력해주세요.");
            return;
        }
        checkDuplicate("email", email, (result) => {
            console.log("이메일 중복 확인 결과:", result);
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
            console.log("전화번호 중복 확인 결과:", result);
        });
    });

    // ✅ 주소 선택 드롭다운 (jQuery)
    const $sido = $("#sido"),
        $sigungu = $("#sigungu"),
        $dong = $("#dong");

    console.log("✅ 시작됨 - fetch /api/regions/sido 직전");

    fetch("/api/regions/sido")
        .then(res => {
            console.log("✅ fetch /api/regions/sido 응답 상태:", res.status);
            return res.json();
        })
        .then(list => {
            console.log("✅ 받아온 시도 목록:", list);
            list.forEach(r => {
                $sido.append(new Option(r.name, r.code));
            });
        })
        .catch(err => {
            console.error("❌ 에러:", err);
        });

    $sido.on("change", () => {
        const code = $sido.val();
        console.log("✅ 시도 선택:", code);
        $sigungu.prop("disabled", !code)
            .empty().append("<option value=''>— 선택 —</option>");
        $dong.prop("disabled", true)
            .empty().append("<option value=''>— 선택 —</option>");
        if (!code) return;

        fetch(`/api/regions/sigungu?code=${encodeURIComponent(code)}`)
            .then(res => res.json())
            .then(list => {
                console.log("✅ 받아온 시군구 목록:", list);
                list.forEach(r => {
                    $sigungu.append(new Option(r.name, r.code));
                });
            });
    });

    $sigungu.on("change", () => {
        const code = $sigungu.val();
        console.log("✅ 시군구 선택:", code);
        $dong.prop("disabled", !code)
            .empty().append("<option value=''>— 선택 —</option>");
        if (!code) return;

        fetch(`/api/regions/dong?code=${encodeURIComponent(code)}`)
            .then(res => res.json())
            .then(list => {
                console.log("✅ 받아온 동 목록:", list);
                list.forEach(r => {
                    $dong.append(new Option(r.name, r.code));
                });
            });
    });

    document.querySelector('form.Big-form').addEventListener('submit', function(e) {
        const pw = document.getElementById('password').value;
        const pwCheck = document.getElementById('passwordCheck').value;
        if (!pw || !pwCheck) {
            alert('비밀번호를 모두 입력해주세요.');
            e.preventDefault();
            return false;
        }
        if (pw !== pwCheck) {
            alert('비밀번호가 일치하지 않습니다.');
            document.getElementById('passwordCheck').focus();
            e.preventDefault();
            return false;
        }
    });

});
