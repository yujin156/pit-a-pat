function removeExistingImage(button, bino) {
    const preview = button.parentElement;
    preview.remove();

    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "deleteImgIds";
    hiddenInput.value = bino;

    document.getElementById("deleteImgContainer").appendChild(hiddenInput);
}

function removeExisting(btn) {
    const box = btn.closest(".image-box");
    const deleteInput = box.querySelector("input[name='deleteImgIds']");
    if (deleteInput) {
        deleteInput.disabled = false; // 활성화해서 서버로 전송되도록
    }
    box.style.display = "none"; // 실제 삭제는 submit 시에 hidden input name="deleteImgIds"가 포함되어 전송됨
}

// 새 이미지 미리보기 + 삭제
function previewNewImages(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById("newImagePreview");

    // 파일 객체 보존을 위한 FileList → 배열 변환
    const dataTransfer = new DataTransfer();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement("div");
            div.className = "img-preview";

            const img = document.createElement("img");
            img.src = e.target.result;

            const btn = document.createElement("button");
            btn.className = "delete-btn";
            btn.textContent = "X";
            btn.onclick = () => {
                div.remove();
                dataTransfer.items.remove(i);
                event.target.files = dataTransfer.files;
            };

            div.appendChild(img);
            div.appendChild(btn);
            previewContainer.appendChild(div);
        };

        dataTransfer.items.add(file); // ✅ 유지된 파일만 다시 넣기
        reader.readAsDataURL(file);
    }

    event.target.files = dataTransfer.files;
}