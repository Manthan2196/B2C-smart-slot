using Backend.DTOs;

namespace Backend.Validators;

public static class RequestValidators
{
    public static string? ValidateOfferRequest(OfferRequest request)
    {
        if (request.OriginalPrice <= 0 || request.OfferPrice <= 0 || request.OfferPrice >= request.OriginalPrice)
        {
            return "Offer price must be greater than zero and less than original price.";
        }

        if (request.EndDate < request.StartDate || request.EndTime <= request.StartTime)
        {
            return "Offer dates or times are invalid.";
        }

        if (request.TotalCapacity <= 0 || request.MaxBookingPerCustomer <= 0)
        {
            return "Capacity and max booking limit must be positive.";
        }

        return null;
    }

    public static string? ValidateOwnerRegistration(OwnerRegistrationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.BusinessName) ||
            string.IsNullOrWhiteSpace(request.BusinessType) ||
            string.IsNullOrWhiteSpace(request.OwnerName) ||
            string.IsNullOrWhiteSpace(request.Phone) ||
            string.IsNullOrWhiteSpace(request.BusinessEmail) ||
            string.IsNullOrWhiteSpace(request.OwnerEmail) ||
            string.IsNullOrWhiteSpace(request.City))
        {
            return "Business name, business type, owner, phone, emails, and city are required.";
        }

        if (!request.OwnerEmail.Contains('@') || !request.BusinessEmail.Contains('@'))
        {
            return "Please enter valid owner and business email addresses.";
        }

        if (request.Password.Length < 8)
        {
            return "Password must be at least 8 characters.";
        }

        if (request.ClosingTime <= request.OpeningTime)
        {
            return "Closing time must be after opening time.";
        }

        return null;
    }
}
