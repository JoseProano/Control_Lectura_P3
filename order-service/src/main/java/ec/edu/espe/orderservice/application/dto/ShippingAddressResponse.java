package ec.edu.espe.orderservice.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ShippingAddressResponse DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddressResponse {

    private String country;
    private String city;
    private String street;
    private String postalCode;
}
