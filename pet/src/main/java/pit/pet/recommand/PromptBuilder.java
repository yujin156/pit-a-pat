package pit.pet.recommand;


import org.springframework.stereotype.Component;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.DogKeyword1;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class PromptBuilder {


    public String buildPrompt(Dog dog) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("이 강아지는 크기가 ").append(dog.getSize());
        prompt.append("이고, 중성화 상태는 ").append(dog.getNeuterStatus()).append("입니다.");
        prompt.append(" 이런 강아지에게 적절한 둘레길을 추천해주세요.");
        return prompt.toString();
    }
    public static String fromDog(Dog dog) {
        // 🐶 크기 변환
        String sizeText = switch (dog.getSize()) {
            case SMALL -> "소형견";
            case MEDIUM -> "중형견";
            case LARGE -> "대형견";
        };

        // 🧬 중성화 여부 변환
        String neuterText = switch (dog.getNeuterStatus()) {
            case NEUTERED -> "중성화된";
            case NOT_NEUTERED -> "중성화되지 않은";
        };

        // 🏷️ 키워드 조합
        List<DogKeyword1> keywordList = dog.getKeywords1();
        String keywordText = keywordList != null && !keywordList.isEmpty()
                ? keywordList.stream()
                .map(DogKeyword1::getDktag)
                .collect(Collectors.joining(", "))
                : "특별한";

        // ✨ 최종 프롬프트 구성
        return String.format(
                "%s %s이며 %s 키워드를 가진 강아지를 위한 산책로를 추천해줘.",
                neuterText,
                sizeText,
                keywordText
        );
    }
}