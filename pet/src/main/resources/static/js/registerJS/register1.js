document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".Big-form");

    // 입력값 유효성 검증
    form.addEventListener("submit", (e) => {
        const name = document.getElementById("name").value.trim();
        const gender = document.getElementById("gender").value;
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const passwordCheck = document.getElementById("passwordCheck").value;
        const phone = document.getElementById("tel").value.trim();
        const sido = document.getElementById("sido").value;

        if (name === "") {
            alert("이름을 입력해주세요!");
            e.preventDefault();
            return;
        }
        if (gender === "") {
            alert("성별을 선택해주세요!");
            e.preventDefault();
            return;
        }
        if (email === "") {
            alert("이메일을 입력해주세요!");
            e.preventDefault();
            return;
        }
        if (password === "") {
            alert("비밀번호를 입력해주세요!");
            e.preventDefault();
            return;
        }
        if (password !== passwordCheck) {
            alert("비밀번호가 일치하지 않습니다!");
            e.preventDefault();
            return;
        }
        if (phone === "") {
            alert("전화번호를 입력해주세요!");
            e.preventDefault();
            return;
        }
        if (sido === "") {
            alert("주소의 시도를 선택해주세요!");
            e.preventDefault();
            return;
        }
    });

    // ✅ 주소 선택 드롭다운 로직 (Vanilla JS)
    const $sido = document.getElementById("sido");
    const $sigungu = document.getElementById("sigungu");
    const $dong = document.getElementById("dong");

    // 1) 시/도 목록 불러오기
    fetch("/api/regions/sido")
        .then(res => res.json())
        .then(list => {
            list.forEach(r => {
                const option = new Option(r.name, r.code);
                $sido.appendChild(option);
            });
        });

    // 2) 시/도 선택 → 시/군/구 목록
    $sido.addEventListener("change", () => {
        const code = $sido.value;
        $sigungu.disabled = !code;
        $sigungu.innerHTML = "<option value=''>— 선택 —</option>";
        $dong.disabled = true;
        $dong.innerHTML = "<option value=''>— 선택 —</option>";

        if (!code) return;

        fetch(`/api/regions/sigungu?code=${encodeURIComponent(code)}`)
            .then(res => res.json())
            .then(list => {
                list.forEach(r => {
                    const option = new Option(r.name, r.code);
                    $sigungu.appendChild(option);
                });
            });
    });

    // 3) 시/군/구 선택 → 동 목록
    $sigungu.addEventListener("change", () => {
        const code = $sigungu.value;
        $dong.disabled = !code;
        $dong.innerHTML = "<option value=''>— 선택 —</option>";

        if (!code) return;

        fetch(`/api/regions/dong?code=${encodeURIComponent(code)}`)
            .then(res => res.json())
            .then(list => {
                list.forEach(r => {
                    const option = new Option(r.name, r.code);
                    $dong.appendChild(option);
                });
            });
    });
});
