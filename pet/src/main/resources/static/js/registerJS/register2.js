document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".Big-form");

    form.addEventListener("submit", (e) => {
        const selectedSize = document.querySelector("input[name='dogSize']:checked");
        if (!selectedSize) {
            alert("강아지 크기를 선택해주세요!");
            e.preventDefault(); // 제출 중지
            return;
        }
    });
});