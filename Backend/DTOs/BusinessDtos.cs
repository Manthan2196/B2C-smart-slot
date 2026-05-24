namespace Backend.DTOs;

public record BusinessRequest(
    string Name,
    string BusinessType,
    string OwnerName,
    string Phone,
    string Email,
    string? Address,
    string City,
    string? LogoUrl,
    TimeOnly OpeningTime,
    TimeOnly ClosingTime);

public record BusinessDto(
    Guid Id,
    string Name,
    string BusinessType,
    string OwnerName,
    string Phone,
    string Email,
    string Address,
    string City,
    string LogoUrl,
    TimeOnly OpeningTime,
    TimeOnly ClosingTime,
    DateTime CreatedAt);
