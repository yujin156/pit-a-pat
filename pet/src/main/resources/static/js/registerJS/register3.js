// register3.js
document.getElementById('dogImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.querySelector('.image-preview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Dog Image" />`;
    };
    reader.readAsDataURL(file);
});

const input = document.getElementById('breedInput');
const list = document.getElementById('autocompleteList');
const speciesListSelect = document.getElementById('speciesListSelect');
const speciesIdHidden = document.getElementById('speciesIdHidden');
const form = document.getElementById('registerForm');

input.addEventListener('input', () => {
    const keyword = input.value.trim();
    if (!keyword) {
        list.innerHTML = '';
        return;
    }

    fetch(`/api/autocomplete?keyword=${encodeURIComponent(keyword)}`)
        .then(res => res.json())
        .then(data => {
            list.innerHTML = '';
            data.forEach(name => {
                const item = document.createElement('div');
                item.textContent = name;
                item.className = 'autocomplete-item';
                item.onclick = () => {
                    input.value = name;
                    list.innerHTML = '';
                    const options = speciesListSelect.querySelectorAll('option');
                    options.forEach(opt => {
                        if (opt.textContent === name) {
                            speciesIdHidden.value = opt.value; // speciesIdHidden에 id 설정!
                        }
                    });
                };
                // 마우스 올리면 배경색 변경
                item.addEventListener('mouseover', () => {
                    item.style.backgroundColor = '#f0f0f0';  // 마우스를 올렸을 때 색상 변경
                    item.style.color = '#387feb';
                });

                item.addEventListener('mouseout', () => {
                    item.style.backgroundColor = '';  // 마우스를 내리면 색상 원래대로
                    item.style.color = '';
                });

                list.appendChild(item);
            });
        });
});

document.addEventListener('click', (e) => {
    if (!list.contains(e.target) && e.target !== input) {
        list.innerHTML = '';
    }
});

form.addEventListener("submit", (e) => {
    const gender = document.getElementById("gender").value;
    const speciesId = speciesIdHidden.value;

    if (!gender) {
        alert("성별을 선택해주세요!");
        e.preventDefault();
        return;
    }
    if (!speciesId) {
        alert("견종을 선택해주세요!");
        e.preventDefault();
    }
});