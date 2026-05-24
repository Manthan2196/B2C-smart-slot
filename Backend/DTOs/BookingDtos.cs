namespace Backend.DTOs;

public record BookingRequest(
    Guid SlotId,
    string CustomerName,
    string CustomerPhone,
    string? CustomerEmail,
    int PeopleCount,
    string? SpecialNote);

public record BookingStatusRequest(string Status);

public record BookingDto(
    Guid Id,
    string BookingReference,
    Guid OfferId,
    string OfferName,
    string BusinessName,
    Guid SlotId,
    DateOnly SlotDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string CustomerName,
    string CustomerPhone,
    string CustomerEmail,
    int PeopleCount,
    string SpecialNote,
    string Status,
    string PaymentStatus,
    string OfferThumbnailUrl,
    string Timeline,
    DateTime CreatedAt);

public record DashboardSummary(
    int TotalOffers,
    int ActiveOffers,
    int TotalBookings,
    int TodaysBookings,
    int TotalCapacity,
    int BookedSeats,
    int AvailableSeats,
    decimal ConversionRate,
    List<BookingDto> RecentBookings);
