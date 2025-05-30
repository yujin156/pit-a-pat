package pit.pet.recommand;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

// RecommendResponseDto.java
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RecommendResponseDto {
    private List<Long> trailIds;
}
