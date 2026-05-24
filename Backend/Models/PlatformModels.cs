using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    [Required]
    public string Role { get; set; } = "Admin";
    public Guid? BusinessId { get; set; }
    public Business? Business { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Business
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    public string BusinessType { get; set; } = "Other";
    [Required]
    public string OwnerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public Guid? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    public TimeOnly OpeningTime { get; set; } = new(9, 0);
    public TimeOnly ClosingTime { get; set; } = new(21, 0);
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Offer> Offers { get; set; } = new List<Offer>();
}

public class Offer
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BusinessId { get; set; }
    public Business Business { get; set; } = null!;
    [Required]
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal OriginalPrice { get; set; }
    public decimal OfferPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
    public DateOnly StartDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly EndDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7));
    public TimeOnly StartTime { get; set; } = new(9, 0);
    public TimeOnly EndTime { get; set; } = new(18, 0);
    public int TotalCapacity { get; set; }
    public int MaxBookingPerCustomer { get; set; } = 1;
    public string TermsAndConditions { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<OfferSlot> Slots { get; set; } = new List<OfferSlot>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public class OfferSlot
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OfferId { get; set; }
    public Offer Offer { get; set; } = null!;
    public DateOnly SlotDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public TimeOnly StartTime { get; set; } = new(10, 0);
    public TimeOnly EndTime { get; set; } = new(11, 0);
    public int Capacity { get; set; }
    public int BookedCount { get; set; }
    public string Status { get; set; } = "Available";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public class Booking
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string BookingReference { get; set; } = string.Empty;
    public Guid OfferId { get; set; }
    public Offer Offer { get; set; } = null!;
    public Guid SlotId { get; set; }
    public OfferSlot Slot { get; set; } = null!;
    [Required]
    public string CustomerName { get; set; } = string.Empty;
    [Required]
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public int PeopleCount { get; set; } = 1;
    public string SpecialNote { get; set; } = string.Empty;
    public string Status { get; set; } = "Confirmed";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
