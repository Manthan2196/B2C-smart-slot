using Backend.DTOs;
using Backend.Models;

namespace Backend.Services;

public static class EntityMutationService
{
    public static void ApplyBusinessRequest(Business business, BusinessRequest request)
    {
        business.Name = request.Name.Trim();
        business.BusinessType = request.BusinessType.Trim();
        business.OwnerName = request.OwnerName.Trim();
        business.Phone = request.Phone.Trim();
        business.Email = request.Email.Trim();
        business.Address = request.Address?.Trim() ?? string.Empty;
        business.City = request.City.Trim();
        business.LogoUrl = request.LogoUrl?.Trim() ?? string.Empty;
        business.OpeningTime = request.OpeningTime;
        business.ClosingTime = request.ClosingTime;
    }

    public static void ApplyOfferRequest(Offer offer, OfferRequest request)
    {
        offer.BusinessId = request.BusinessId;
        offer.Title = request.Title.Trim();
        offer.Description = request.Description.Trim();
        offer.Category = request.Category.Trim();
        offer.OriginalPrice = request.OriginalPrice;
        offer.OfferPrice = request.OfferPrice;
        offer.DiscountPercentage = Math.Round((request.OriginalPrice - request.OfferPrice) / request.OriginalPrice * 100, 2);
        offer.StartDate = request.StartDate;
        offer.EndDate = request.EndDate;
        offer.StartTime = request.StartTime;
        offer.EndTime = request.EndTime;
        offer.TotalCapacity = request.TotalCapacity;
        offer.MaxBookingPerCustomer = request.MaxBookingPerCustomer;
        offer.TermsAndConditions = request.TermsAndConditions?.Trim() ?? string.Empty;
        offer.Status = request.Status.Trim();
    }

    public static void ApplySlotRequest(OfferSlot slot, SlotRequest request)
    {
        slot.OfferId = request.OfferId;
        slot.SlotDate = request.SlotDate;
        slot.StartTime = request.StartTime;
        slot.EndTime = request.EndTime;
        slot.Capacity = request.Capacity;
        slot.Status = slot.BookedCount >= request.Capacity ? "Full" : request.Status.Trim();
    }
}
