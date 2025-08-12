package pit.pet.recommand;

import lombok.Data;

import java.util.List;

@Data
public class RecommendationResponse {
    private List<String> recommendations;
}