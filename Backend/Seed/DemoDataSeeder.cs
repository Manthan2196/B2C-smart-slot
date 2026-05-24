using Backend.Data;
using Backend.Helpers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Seed;

public static class DemoDataSeeder
{
    public static async Task SeedAsync(BookingPlatformDbContext db)
    {
        var platformAdmin = await db.Users.FirstOrDefaultAsync(u => u.Email == "admin@willovate.demo");
        if (platformAdmin is null)
        {
            db.Users.Add(new User
            {
                Name = "Willovate Platform Admin",
                Email = "admin@willovate.demo",
                PasswordHash = PasswordHelper.HashPassword("Admin@123"),
                Role = "SuperAdmin"
            });
        }
        else
        {
            platformAdmin.Name = "Willovate Platform Admin";
            platformAdmin.Role = "SuperAdmin";
            platformAdmin.BusinessId = null;
        }

        await db.SaveChangesAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var pulseFit = await EnsureBusinessAsync("PulseFit Studio", "Gym", "Aarav Mehta", "9876543210", "hello@pulsefit.demo", "MG Road Fitness Hub", "Mumbai", new TimeOnly(6, 0), new TimeOnly(22, 0));
        var spiceCourt = await EnsureBusinessAsync("Spice Court Bistro", "Restaurant", "Nisha Shah", "9123456780", "offers@spicecourt.demo", "Alkapuri Main Road", "Vadodara", new TimeOnly(11, 0), new TimeOnly(23, 0));
        var glowSalon = await EnsureBusinessAsync("Glow Hour Salon", "Salon", "Riya Kapoor", "9988776655", "bookings@glowhour.demo", "Satellite Beauty Lane", "Ahmedabad", new TimeOnly(10, 0), new TimeOnly(20, 0));
        var careClinic = await EnsureBusinessAsync("CareFirst Clinic", "Clinic", "Dr. Meera Iyer", "9090909090", "desk@carefirst.demo", "Bandra Health Square", "Mumbai", new TimeOnly(8, 0), new TimeOnly(18, 0));
        var turfZone = await EnsureBusinessAsync("TurfZone Arena", "Turf", "Kabir Khan", "9000011111", "play@turfzone.demo", "Ring Road Sports Park", "Surat", new TimeOnly(5, 0), new TimeOnly(23, 0));
        var brightMinds = await EnsureBusinessAsync("BrightMinds Coaching", "Coaching", "Ishaan Desai", "9111122222", "learn@brightminds.demo", "Knowledge Park, Sector 8", "Pune", new TimeOnly(8, 0), new TimeOnly(20, 0));

        await EnsureOwnerUserAsync("PulseFit Owner", "gym@willovate.demo", pulseFit);
        await EnsureOwnerUserAsync("Spice Court Owner", "restaurant@willovate.demo", spiceCourt);
        await EnsureOwnerUserAsync("Glow Hour Owner", "salon@willovate.demo", glowSalon);
        await EnsureOwnerUserAsync("CareFirst Owner", "clinic@willovate.demo", careClinic);
        await EnsureOwnerUserAsync("TurfZone Owner", "turf@willovate.demo", turfZone);
        await EnsureOwnerUserAsync("BrightMinds Owner", "coaching@willovate.demo", brightMinds);

        var gymOffer = await EnsureOfferAsync(pulseFit, "Afternoon Gym Trial", "Try a coached afternoon workout session with access to cardio, weights, and recovery zone.", "Fitness", 499, 99, today, today.AddDays(7), new TimeOnly(15, 0), new TimeOnly(17, 0), 20, 1, "Valid for first-time visitors only. Please arrive 10 minutes early.", "Active");
        await EnsureSlotAsync(gymOffer, today.AddDays(1), new TimeOnly(15, 0), new TimeOnly(16, 0), 10, "Available");
        await EnsureSlotAsync(gymOffer, today.AddDays(1), new TimeOnly(16, 0), new TimeOnly(17, 0), 10, "Available");

        var lunchOffer = await EnsureOfferAsync(spiceCourt, "Lunch Hour Deal", "A quick weekday lunch combo with starter, main course, and cooler.", "Food", 799, 399, today, today.AddDays(5), new TimeOnly(12, 0), new TimeOnly(15, 0), 30, 4, "Dine-in only. Taxes extra if applicable.", "Active");
        await EnsureSlotAsync(lunchOffer, today.AddDays(1), new TimeOnly(12, 0), new TimeOnly(13, 0), 12, "Available");
        await EnsureSlotAsync(lunchOffer, today.AddDays(1), new TimeOnly(13, 0), new TimeOnly(14, 0), 18, "Available");

        var salonOffer = await EnsureOfferAsync(glowSalon, "Salon Happy Hour", "Hair spa and blow-dry bundle for weekday afternoon appointments.", "Beauty", 1499, 699, today, today.AddDays(10), new TimeOnly(14, 0), new TimeOnly(18, 0), 16, 2, "Prior appointment required. Not valid with other coupons.", "Active");
        await EnsureSlotAsync(salonOffer, today.AddDays(2), new TimeOnly(14, 0), new TimeOnly(15, 0), 8, "Available");
        await EnsureSlotAsync(salonOffer, today.AddDays(2), new TimeOnly(16, 0), new TimeOnly(17, 0), 8, "Available");

        var clinicOffer = await EnsureOfferAsync(careClinic, "Doctor Consultation Discount", "General physician consultation slot with basic vitals check.", "Healthcare", 700, 350, today, today.AddDays(14), new TimeOnly(9, 0), new TimeOnly(12, 0), 12, 1, "Emergency cases are not covered under this offer.", "Active");
        await EnsureSlotAsync(clinicOffer, today.AddDays(3), new TimeOnly(9, 0), new TimeOnly(10, 0), 6, "Available");
        await EnsureSlotAsync(clinicOffer, today.AddDays(3), new TimeOnly(10, 0), new TimeOnly(11, 0), 6, "Available");

        var turfOffer = await EnsureOfferAsync(turfZone, "Turf Morning Slot Offer", "Discounted one-hour football turf booking for early morning players.", "Sports", 2200, 1299, today, today.AddDays(6), new TimeOnly(6, 0), new TimeOnly(9, 0), 24, 8, "Shoes required. Cancellation allowed up to 12 hours before slot.", "Active");
        await EnsureSlotAsync(turfOffer, today.AddDays(1), new TimeOnly(6, 0), new TimeOnly(7, 0), 12, "Available");
        await EnsureSlotAsync(turfOffer, today.AddDays(1), new TimeOnly(7, 0), new TimeOnly(8, 0), 12, "Available");

        var coachingOffer = await EnsureOfferAsync(brightMinds, "Coaching Demo Class", "A focused demo class with concept mapping, doubt solving, and study-plan guidance.", "Education", 999, 199, today, today.AddDays(9), new TimeOnly(17, 0), new TimeOnly(19, 0), 25, 1, "Valid for new students only. Parent attendance allowed for school batches.", "Active");
        await EnsureSlotAsync(coachingOffer, today.AddDays(2), new TimeOnly(17, 0), new TimeOnly(18, 0), 12, "Available");
        await EnsureSlotAsync(coachingOffer, today.AddDays(2), new TimeOnly(18, 0), new TimeOnly(19, 0), 13, "Available");

        await db.SaveChangesAsync();

        await EnsureBookingAsync("WB-DEMO-1001", lunchOffer.Title, today.AddDays(1), new TimeOnly(12, 0), "Dev Patel", "8000000001", "dev@example.com", 2, "Window table if possible.", "Confirmed");
        await EnsureBookingAsync("WB-DEMO-1002", salonOffer.Title, today.AddDays(2), new TimeOnly(14, 0), "Ananya Rao", "8000000002", "ananya@example.com", 1, "Sensitive scalp.", "Pending");
        await db.SaveChangesAsync();

        async Task<Business> EnsureBusinessAsync(string name, string businessType, string ownerName, string phone, string email, string address, string city, TimeOnly openingTime, TimeOnly closingTime)
        {
            var business = await db.Businesses.FirstOrDefaultAsync(b => b.Email == email);
            if (business is null)
            {
                business = new Business { Email = email };
                db.Businesses.Add(business);
            }

            business.Name = name;
            business.BusinessType = businessType;
            business.OwnerName = ownerName;
            business.Phone = phone;
            business.Address = address;
            business.City = city;
            business.OpeningTime = openingTime;
            business.ClosingTime = closingTime;
            return business;
        }

        async Task<Offer> EnsureOfferAsync(Business business, string title, string description, string category, decimal originalPrice, decimal offerPrice, DateOnly startDate, DateOnly endDate, TimeOnly startTime, TimeOnly endTime, int totalCapacity, int maxBookingPerCustomer, string terms, string status)
        {
            var offer = await db.Offers.FirstOrDefaultAsync(o => o.Title == title);
            if (offer is null)
            {
                offer = new Offer { Title = title };
                db.Offers.Add(offer);
            }

            offer.Business = business;
            offer.BusinessId = business.Id;
            offer.Description = description;
            offer.Category = category;
            offer.OriginalPrice = originalPrice;
            offer.OfferPrice = offerPrice;
            offer.DiscountPercentage = Math.Round((originalPrice - offerPrice) / originalPrice * 100, 2);
            offer.StartDate = startDate;
            offer.EndDate = endDate;
            offer.StartTime = startTime;
            offer.EndTime = endTime;
            offer.TotalCapacity = totalCapacity;
            offer.MaxBookingPerCustomer = maxBookingPerCustomer;
            offer.TermsAndConditions = terms;
            offer.Status = status;
            offer.UpdatedAt = DateTime.UtcNow;
            return offer;
        }

        async Task EnsureSlotAsync(Offer offer, DateOnly slotDate, TimeOnly startTime, TimeOnly endTime, int capacity, string status)
        {
            var slot = await db.OfferSlots.FirstOrDefaultAsync(s => s.OfferId == offer.Id && s.SlotDate == slotDate && s.StartTime == startTime);
            if (slot is null)
            {
                slot = new OfferSlot { Offer = offer, OfferId = offer.Id, SlotDate = slotDate, StartTime = startTime };
                db.OfferSlots.Add(slot);
            }

            slot.EndTime = endTime;
            slot.Capacity = capacity;
            slot.Status = status;
        }

        async Task EnsureBookingAsync(string reference, string offerTitle, DateOnly slotDate, TimeOnly slotStartTime, string customerName, string customerPhone, string customerEmail, int peopleCount, string note, string status)
        {
            if (await db.Bookings.AnyAsync(b => b.BookingReference == reference))
            {
                return;
            }

            var offer = await db.Offers.FirstAsync(o => o.Title == offerTitle);
            var slot = await db.OfferSlots.FirstAsync(s => s.OfferId == offer.Id && s.SlotDate == slotDate && s.StartTime == slotStartTime);
            slot.BookedCount += peopleCount;
            if (slot.BookedCount >= slot.Capacity)
            {
                slot.Status = "Full";
            }

            db.Bookings.Add(new Booking
            {
                BookingReference = reference,
                OfferId = offer.Id,
                SlotId = slot.Id,
                CustomerName = customerName,
                CustomerPhone = customerPhone,
                CustomerEmail = customerEmail,
                PeopleCount = peopleCount,
                SpecialNote = note,
                Status = status
            });
        }

        async Task EnsureOwnerUserAsync(string name, string email, Business business)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user is null)
            {
                user = new User
                {
                    Email = email,
                    PasswordHash = PasswordHelper.HashPassword("Owner@123")
                };
                db.Users.Add(user);
            }

            user.Name = name;
            user.Role = "BusinessOwner";
            user.Business = business;
            user.BusinessId = business.Id;
            business.CreatedByUserId = user.Id;
        }
    }
}
