namespace Backend.DTOs;

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    Guid Id,
    string Name,
    string Email,
    string Role,
    Guid? BusinessId,
    string? BusinessName,
    string? BusinessType);

public record OwnerRegistrationRequest(
    string BusinessName,
    string BusinessType,
    string OwnerName,
    string Phone,
    string BusinessEmail,
    string OwnerEmail,
    string? Address,
    string City,
    string? LogoUrl,
    TimeOnly OpeningTime,
    TimeOnly ClosingTime,
    string Password);
