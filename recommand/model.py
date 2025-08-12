from transformers import AutoTokenizer, AutoModelForSeq2SeqLM  # ✅ 변경됨
import torch

model_name = "google/flan-t5-base"  # ✅ 올바른 모델 이름

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)  # ✅ 클래스 변경됨

def recommend(user_input: str, max_tokens: int = 50) -> list[str]:
    prompt = f"사용자 선호: {user_input}\n추천 목록:"
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=max_tokens)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # 결과 정제
    lines = result.strip().split("\n")
    return [l.strip("1234567890. •-").strip() for l in lines if l.strip()]
