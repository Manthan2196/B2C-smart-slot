using Backend.Data;
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Services;
using Backend.Validators;
using Microsoft.EntityFrameworkCore;

namespace Backend.Extensions;

public static class PlatformEndpointExtensions
{
    public static WebApplication MapPlatformEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/login", Login).WithTags("Auth");
        app.MapPost("/api/auth/register-business-owner", RegisterBusinessOwner).WithTags("Auth");

        app.MapPost("/api/business", CreateBusiness).WithTags("Business");
        app.MapGet("/api/business", GetBusinesses).WithTags("Business");
        app.MapPut("/api/business/{id:guid}", UpdateBusiness).WithTags("Business");

        app.MapPost("/api/offers", CreateOffer).WithTags("Offers");
        app.MapGet("/api/offers", GetOffers).WithTags("Offers");
        app.MapGet("/api/offers/{id:guid}", GetOfferById).WithTags("Offers");
        app.MapPut("/api/offers/{id:guid}", UpdateOffer).WithTags("Offers");
        app.MapDelete("/api/offers/{id:guid}", DeleteOffer).WithTags("Offers");

        app.MapPost("/api/slots", CreateSlot).WithTags("Slots");
        app.MapGet("/api/slots", GetSlots).WithTags("Slots");
        app.MapGet("/api/offers/{offerId:guid}/slots", GetSlotsForOffer).WithTags("Slots");
        app.MapPut("/api/slots/{id:guid}", UpdateSlot).WithTags("Slots");
        app.MapDelete("/api/slots/{id:guid}", DeleteSlot).WithTags("Slots");

        app.MapPost("/api/bookings", CreateBooking).WithTags("Bookings");
        app.MapGet("/api/bookings", GetBookings).WithTags("Bookings");
        app.MapGet("/api/bookings/{id:guid}", GetBookingById).WithTags("Bookings");
        app.MapPut("/api/bookings/{id:guid}/status", UpdateBookingStatus).WithTags("Bookings");

        app.MapGet("/api/dashboard/summary", GetDashboardSummary).WithTags("Dashboard");

        return app;
    }

    private static async Task<IResult> Login(LoginRequest request, BookingPlatformDbContext db)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.Include(u => u.Business).FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user is null || user.PasswordHash != PasswordHelper.HashPassword(request.Password))
        {
            return Results.Unauthorized();
        }

        return Results.Ok(new LoginResponse(user.Id, user.Name, user.Email, user.Role, user.BusinessId, user.Business?.Name, user.Business?.BusinessType));
    }

    private static async Task<IResult> RegisterBusinessOwner(OwnerRegistrationRequest request, BookingPlatformDbContext db)
    {
        var validation = RequestValidators.ValidateOwnerRegistration(request);
        if (validation is not null)
        {
            return Results.BadRequest(validation);
        }

        var ownerEmail = request.OwnerEmail.Trim().ToLowerInvariant();
        var businessEmail = request.BusinessEmail.Trim().ToLowerInvariant();

        if (await db.Users.AnyAsync(u => u.Email.ToLower() == ownerEmail))
        {
            return Results.BadRequest("An account with this owner email already exists.");
        }

        if (await db.Businesses.AnyAsync(b => b.Email.ToLower() == businessEmail))
        {
            return Results.BadRequest("A business with this email already exists.");
        }

        var business = new Business
        {
            Name = request.BusinessName.Trim(),
            BusinessType = request.BusinessType.Trim(),
            OwnerName = request.OwnerName.Trim(),
            Phone = request.Phone.Trim(),
            Email = businessEmail,
            Address = request.Address?.Trim() ?? string.Empty,
            City = request.City.Trim(),
            LogoUrl = request.LogoUrl?.Trim() ?? string.Empty,
            OpeningTime = request.OpeningTime,
            ClosingTime = request.ClosingTime
        };

        var user = new User
        {
            Name = request.OwnerName.Trim(),
            Email = ownerEmail,
            PasswordHash = PasswordHelper.HashPassword(request.Password),
            Role = "BusinessOwner",
            Business = business
        };

        db.Businesses.Add(business);
        db.Users.Add(user);
        await db.SaveChangesAsync();
        business.CreatedByUserId = user.Id;
        await db.SaveChangesAsync();

        return Results.Created($"/api/business/{business.Id}", new LoginResponse(user.Id, user.Name, user.Email, user.Role, business.Id, business.Name, business.BusinessType));
    }

    private static async Task<IResult> CreateBusiness(BusinessRequest request, BookingPlatformDbContext db)
    {
        var business = new Business();
        EntityMutationService.ApplyBusinessRequest(business, request);
        db.Businesses.Add(business);
        await db.SaveChangesAsync();
        return Results.Created($"/api/business/{business.Id}", DtoMapper.ToBusinessDto(business));
    }

    private static async Task<IResult> GetBusinesses(BookingPlatformDbContext db)
    {
        var businesses = await db.Businesses.OrderBy(b => b.Name).ToListAsync();
        return Results.Ok(businesses.Select(DtoMapper.ToBusinessDto));
    }

    private static async Task<IResult> UpdateBusiness(Guid id, BusinessRequest request, BookingPlatformDbContext db)
    {
        var business = await db.Businesses.FindAsync(id);
        if (business is null)
        {
            return Results.NotFound();
        }

        EntityMutationService.ApplyBusinessRequest(business, request);
        await db.SaveChangesAsync();
        return Results.Ok(DtoMapper.ToBusinessDto(business));
    }

    private static async Task<IResult> CreateOffer(OfferRequest request, BookingPlatformDbContext db)
    {
        var validation = RequestValidators.ValidateOfferRequest(request);
        if (validation is not null)
        {
            return Results.BadRequest(validation);
        }

        if (!await db.Businesses.AnyAsync(b => b.Id == request.BusinessId))
        {
            return Results.BadRequest("Business not found.");
        }

        var offer = new Offer();
        EntityMutationService.ApplyOfferRequest(offer, request);
        db.Offers.Add(offer);
        await db.SaveChangesAsync();

        var savedOffer = await db.Offers.Include(o => o.Business).Include(o => o.Slots).FirstAsync(o => o.Id == offer.Id);
        return Results.Created($"/api/offers/{offer.Id}", DtoMapper.ToOfferDto(savedOffer));
    }

    private static async Task<IResult> GetOffers(string? businessType, string? category, DateOnly? date, decimal? minPrice, decimal? maxPrice, bool? availableOnly, bool? includeInactive, BookingPlatformDbContext db)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = db.Offers.Include(o => o.Business).Include(o => o.Slots).AsQueryable();

        if (includeInactive != true)
        {
            query = query.Where(o => o.Status == "Active" && o.EndDate >= today);
        }

        if (!string.IsNullOrWhiteSpace(businessType))
        {
            query = query.Where(o => o.Business.BusinessType == businessType);
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(o => o.Category == category);
        }

        if (date is not null)
        {
            query = query.Where(o => o.Slots.Any(s => s.SlotDate == date));
        }

        if (minPrice is not null)
        {
            query = query.Where(o => o.OfferPrice >= minPrice);
        }

        if (maxPrice is not null)
        {
            query = query.Where(o => o.OfferPrice <= maxPrice);
        }

        if (availableOnly == true)
        {
            query = query.Where(o => o.Slots.Any(s => s.Status == "Available" && s.BookedCount < s.Capacity));
        }

        var offers = await query.OrderBy(o => o.EndDate).ThenBy(o => o.Title).ToListAsync();
        return Results.Ok(offers.Select(DtoMapper.ToOfferDto).ToList());
    }

    private static async Task<IResult> GetOfferById(Guid id, BookingPlatformDbContext db)
    {
        var offer = await db.Offers.Include(o => o.Business).Include(o => o.Slots.OrderBy(s => s.SlotDate).ThenBy(s => s.StartTime)).FirstOrDefaultAsync(o => o.Id == id);
        return offer is null ? Results.NotFound() : Results.Ok(DtoMapper.ToOfferDto(offer));
    }

    private static async Task<IResult> UpdateOffer(Guid id, OfferRequest request, BookingPlatformDbContext db)
    {
        var validation = RequestValidators.ValidateOfferRequest(request);
        if (validation is not null)
        {
            return Results.BadRequest(validation);
        }

        var offer = await db.Offers.FindAsync(id);
        if (offer is null)
        {
            return Results.NotFound();
        }

        EntityMutationService.ApplyOfferRequest(offer, request);
        offer.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var savedOffer = await db.Offers.Include(o => o.Business).Include(o => o.Slots).FirstAsync(o => o.Id == offer.Id);
        return Results.Ok(DtoMapper.ToOfferDto(savedOffer));
    }

    private static async Task<IResult> DeleteOffer(Guid id, BookingPlatformDbContext db)
    {
        var offer = await db.Offers.FindAsync(id);
        if (offer is null)
        {
            return Results.NotFound();
        }

        db.Offers.Remove(offer);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    private static async Task<IResult> CreateSlot(SlotRequest request, BookingPlatformDbContext db)
    {
        var offer = await db.Offers.FindAsync(request.OfferId);
        if (offer is null)
        {
            return Results.BadRequest("Offer not found.");
        }

        if (request.EndTime <= request.StartTime || request.Capacity <= 0)
        {
            return Results.BadRequest("Slot time and capacity are invalid.");
        }

        var slot = new OfferSlot();
        EntityMutationService.ApplySlotRequest(slot, request);
        db.OfferSlots.Add(slot);
        await db.SaveChangesAsync();
        return Results.Created($"/api/slots/{slot.Id}", DtoMapper.ToSlotDto(slot));
    }

    private static async Task<IResult> GetSlots(BookingPlatformDbContext db)
    {
        var slots = await db.OfferSlots.OrderBy(s => s.SlotDate).ThenBy(s => s.StartTime).ToListAsync();
        return Results.Ok(slots.Select(DtoMapper.ToSlotDto));
    }

    private static async Task<IResult> GetSlotsForOffer(Guid offerId, BookingPlatformDbContext db)
    {
        var slots = await db.OfferSlots.Where(s => s.OfferId == offerId).OrderBy(s => s.SlotDate).ThenBy(s => s.StartTime).ToListAsync();
        return Results.Ok(slots.Select(DtoMapper.ToSlotDto));
    }

    private static async Task<IResult> UpdateSlot(Guid id, SlotRequest request, BookingPlatformDbContext db)
    {
        var slot = await db.OfferSlots.FindAsync(id);
        if (slot is null)
        {
            return Results.NotFound();
        }

        if (request.Capacity < slot.BookedCount)
        {
            return Results.BadRequest("Capacity cannot be less than already booked seats.");
        }

        EntityMutationService.ApplySlotRequest(slot, request);
        if (slot.BookedCount >= slot.Capacity)
        {
            slot.Status = "Full";
        }

        await db.SaveChangesAsync();
        return Results.Ok(DtoMapper.ToSlotDto(slot));
    }

    private static async Task<IResult> DeleteSlot(Guid id, BookingPlatformDbContext db)
    {
        var slot = await db.OfferSlots.FindAsync(id);
        if (slot is null)
        {
            return Results.NotFound();
        }

        db.OfferSlots.Remove(slot);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    private static async Task<IResult> CreateBooking(BookingRequest request, BookingPlatformDbContext db)
    {
        var slot = await db.OfferSlots.Include(s => s.Offer).ThenInclude(o => o.Business).FirstOrDefaultAsync(s => s.Id == request.SlotId);
        if (slot is null)
        {
            return Results.BadRequest("Slot not found.");
        }

        var offer = slot.Offer;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var availableSeats = slot.Capacity - slot.BookedCount;

        if (offer.Status != "Active" || offer.EndDate < today)
        {
            return Results.BadRequest("Expired or inactive offers cannot be booked.");
        }

        if (slot.Status != "Available" || availableSeats <= 0)
        {
            return Results.BadRequest("Slot is not available.");
        }

        if (request.PeopleCount <= 0 || request.PeopleCount > availableSeats)
        {
            return Results.BadRequest("People count exceeds available capacity.");
        }

        var existingPeople = await db.Bookings.Where(b => b.OfferId == offer.Id && b.CustomerPhone == request.CustomerPhone && b.Status != "Cancelled").SumAsync(b => b.PeopleCount);
        if (existingPeople + request.PeopleCount > offer.MaxBookingPerCustomer)
        {
            return Results.BadRequest("This phone number has reached the booking limit for this offer.");
        }

        var booking = new Booking
        {
            BookingReference = await GenerateBookingReferenceAsync(db),
            OfferId = offer.Id,
            SlotId = slot.Id,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CustomerEmail = request.CustomerEmail?.Trim() ?? string.Empty,
            PeopleCount = request.PeopleCount,
            SpecialNote = request.SpecialNote?.Trim() ?? string.Empty,
            Status = "Confirmed"
        };

        slot.BookedCount += request.PeopleCount;
        if (slot.BookedCount >= slot.Capacity)
        {
            slot.Status = "Full";
        }

        db.Bookings.Add(booking);
        await db.SaveChangesAsync();

        var savedBooking = await db.Bookings.Include(b => b.Offer).ThenInclude(o => o.Business).Include(b => b.Slot).FirstAsync(b => b.Id == booking.Id);
        return Results.Created($"/api/bookings/{booking.Id}", DtoMapper.ToBookingDto(savedBooking));
    }

    private static async Task<IResult> GetBookings(BookingPlatformDbContext db)
    {
        var bookings = await db.Bookings.Include(b => b.Offer).ThenInclude(o => o.Business).Include(b => b.Slot).OrderByDescending(b => b.CreatedAt).ToListAsync();
        return Results.Ok(bookings.Select(DtoMapper.ToBookingDto).ToList());
    }

    private static async Task<IResult> GetBookingById(Guid id, BookingPlatformDbContext db)
    {
        var booking = await db.Bookings.Include(b => b.Offer).ThenInclude(o => o.Business).Include(b => b.Slot).FirstOrDefaultAsync(b => b.Id == id);
        return booking is null ? Results.NotFound() : Results.Ok(DtoMapper.ToBookingDto(booking));
    }

    private static async Task<IResult> UpdateBookingStatus(Guid id, BookingStatusRequest request, BookingPlatformDbContext db)
    {
        var booking = await db.Bookings.Include(b => b.Slot).FirstOrDefaultAsync(b => b.Id == id);
        if (booking is null)
        {
            return Results.NotFound();
        }

        var previousStatus = booking.Status;
        booking.Status = request.Status;

        if (request.Status == "Cancelled" && previousStatus != "Cancelled")
        {
            booking.Slot.BookedCount = Math.Max(0, booking.Slot.BookedCount - booking.PeopleCount);
            if (booking.Slot.Status == "Full")
            {
                booking.Slot.Status = "Available";
            }
        }

        await db.SaveChangesAsync();

        var savedBooking = await db.Bookings.Include(b => b.Offer).ThenInclude(o => o.Business).Include(b => b.Slot).FirstAsync(b => b.Id == booking.Id);
        return Results.Ok(DtoMapper.ToBookingDto(savedBooking));
    }

    private static async Task<IResult> GetDashboardSummary(BookingPlatformDbContext db)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var totalOffers = await db.Offers.CountAsync();
        var activeOffers = await db.Offers.CountAsync(o => o.Status == "Active");
        var totalBookings = await db.Bookings.CountAsync();
        var todaysBookings = await db.Bookings.CountAsync(b => DateOnly.FromDateTime(b.CreatedAt) == today);
        var totalCapacity = await db.OfferSlots.SumAsync(s => s.Capacity);
        var bookedSeats = await db.OfferSlots.SumAsync(s => s.BookedCount);
        var availableSeats = Math.Max(0, totalCapacity - bookedSeats);
        var conversionRate = totalCapacity == 0 ? 0 : Math.Round((decimal)bookedSeats / totalCapacity * 100, 2);

        var recentBookingEntities = await db.Bookings.Include(b => b.Offer).ThenInclude(o => o.Business).Include(b => b.Slot).OrderByDescending(b => b.CreatedAt).Take(8).ToListAsync();
        return Results.Ok(new DashboardSummary(totalOffers, activeOffers, totalBookings, todaysBookings, totalCapacity, bookedSeats, availableSeats, conversionRate, recentBookingEntities.Select(DtoMapper.ToBookingDto).ToList()));
    }

    private static async Task<string> GenerateBookingReferenceAsync(BookingPlatformDbContext db)
    {
        string reference;
        do
        {
            reference = $"WB-{DateTime.UtcNow:yyMMdd}-{Random.Shared.Next(1000, 9999)}";
        } while (await db.Bookings.AnyAsync(b => b.BookingReference == reference));

        return reference;
    }
}
