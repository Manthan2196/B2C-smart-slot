using Backend.DTOs;
using Backend.Models;

namespace Backend.Services;

public static class DtoMapper
{
    public static BusinessDto ToBusinessDto(Business business) =>
        new(
            business.Id,
            business.Name,
            business.BusinessType,
            business.OwnerName,
            business.Phone,
            business.Email,
            business.Address,
            business.City,
            business.LogoUrl,
            business.OpeningTime,
            business.ClosingTime,
            business.CreatedAt);

    public static OfferDto ToOfferDto(Offer offer)
    {
        var slots = offer.Slots.OrderBy(s => s.SlotDate).ThenBy(s => s.StartTime).Select(ToSlotDto).ToList();
        var bookedSeats = slots.Sum(s => s.BookedCount);

        return new OfferDto(
            offer.Id,
            offer.BusinessId,
            offer.Business.Name,
            offer.Business.BusinessType,
            offer.Business.City,
            offer.Title,
            offer.Description,
            offer.Category,
            offer.OriginalPrice,
            offer.OfferPrice,
            offer.DiscountPercentage,
            offer.StartDate,
            offer.EndDate,
            offer.StartTime,
            offer.EndTime,
            offer.TotalCapacity,
            offer.MaxBookingPerCustomer,
            offer.TermsAndConditions,
            offer.Status,
            offer.CreatedAt,
            offer.UpdatedAt,
            slots.Count,
            bookedSeats,
            Math.Max(0, slots.Sum(s => s.AvailableCount)),
            BuildOfferThumbnail(offer),
            slots);
    }

    public static SlotDto ToSlotDto(OfferSlot slot) =>
        new(
            slot.Id,
            slot.OfferId,
            slot.SlotDate,
            slot.StartTime,
            slot.EndTime,
            slot.Capacity,
            slot.BookedCount,
            Math.Max(0, slot.Capacity - slot.BookedCount),
            slot.Capacity == 0 ? 0 : Math.Round((decimal)slot.BookedCount / slot.Capacity * 100, 2),
            slot.BookedCount >= slot.Capacity ? "Full" : slot.Status,
            slot.CreatedAt);

    public static BookingDto ToBookingDto(Booking booking) =>
        new(
            booking.Id,
            booking.BookingReference,
            booking.OfferId,
            booking.Offer.Title,
            booking.Offer.Business.Name,
            booking.SlotId,
            booking.Slot.SlotDate,
            booking.Slot.StartTime,
            booking.Slot.EndTime,
            booking.CustomerName,
            booking.CustomerPhone,
            booking.CustomerEmail,
            booking.PeopleCount,
            booking.SpecialNote,
            booking.Status,
            "Unpaid",
            BuildOfferThumbnail(booking.Offer),
            $"{booking.Status} at {booking.CreatedAt:yyyy-MM-dd HH:mm} UTC",
            booking.CreatedAt);

    public static string BuildOfferThumbnail(Offer offer)
    {
        var type = Uri.EscapeDataString(offer.Business.BusinessType);
        var title = Uri.EscapeDataString(offer.Title);
        return $"willovate://ambient/{type}/{title}";
    }
}
