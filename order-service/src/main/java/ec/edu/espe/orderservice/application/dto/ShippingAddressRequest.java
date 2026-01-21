package ec.edu.espe.orderservice.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ShippingAddressRequest DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddressRequest {

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Street is required")
    private String street;

    @NotBlank(message = "Postal code is required")
    private String postalCode;
}
