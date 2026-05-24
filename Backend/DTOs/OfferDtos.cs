namespace Backend.DTOs;

public record OfferRequest(
    Guid BusinessId,
    string Title,
    string Description,
    string Category,
    decimal OriginalPrice,
    decimal OfferPrice,
    DateOnly StartDate,
    DateOnly EndDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    int TotalCapacity,
    int MaxBookingPerCustomer,
    string? TermsAndConditions,
    string Status);

public record SlotRequest(
    Guid OfferId,
    DateOnly SlotDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    int Capacity,
    string Status);

public record SlotDto(
    Guid Id,
    Guid OfferId,
    DateOnly SlotDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    int Capacity,
    int BookedCount,
    int AvailableCount,
    decimal BookingPercentage,
    string Status,
    DateTime CreatedAt);

public record OfferDto(
    Guid Id,
    Guid BusinessId,
    string BusinessName,
    string BusinessType,
    string City,
    string Title,
    string Description,
    string Category,
    decimal OriginalPrice,
    decimal OfferPrice,
    decimal DiscountPercentage,
    DateOnly StartDate,
    DateOnly EndDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    int TotalCapacity,
    int MaxBookingPerCustomer,
    string TermsAndConditions,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int SlotCount,
    int BookedSeats,
    int AvailableSlots,
    string ThumbnailUrl,
    List<SlotDto> Slots);
