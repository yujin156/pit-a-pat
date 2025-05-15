package pit.pet.Spec;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.Unmarshaller;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SpecService {
    private final SpecRepository speciesRepository;

    private static final String API_URL =
            "http://211.237.50.150:7080/openapi/ee53c30ea5aadc490c901cf05061945a9de809495a041ce6e17476b0dd0b79a5/xml/Grid_20210806000000000612_1/1/1000";


    public void fetchAndSaveBreeds() throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        String xml = restTemplate.getForObject(API_URL, String.class);

        JAXBContext context = JAXBContext.newInstance(SpecResponse.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        SpecResponse response = (SpecResponse) unmarshaller.unmarshal(new StringReader(xml));
        List<SpecResponse.Row> rows = response.getRow();

        Set<String> saved = new HashSet<>();
        for (SpecResponse.Row row : rows) {
            // '개'만 저장
            if ("개".equals(row.getLvstckKnd())) {
                String breedName = row.getSpcs();

                if (breedName != null && !breedName.isBlank() && !saved.contains(breedName)) {
                    Species breed = new Species();
                    breed.setName(breedName);
                    speciesRepository.save(breed);
                    saved.add(breedName);
                }
            }
        }
    }
}