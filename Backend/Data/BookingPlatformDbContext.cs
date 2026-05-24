using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class BookingPlatformDbContext : DbContext
{
    public BookingPlatformDbContext(DbContextOptions<BookingPlatformDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<OfferSlot> OfferSlots => Set<OfferSlot>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasOne(u => u.Business)
            .WithMany(b => b.Users)
            .HasForeignKey(u => u.BusinessId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Business>()
            .HasOne(b => b.CreatedByUser)
            .WithMany()
            .HasForeignKey(b => b.CreatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Booking>()
            .HasIndex(b => b.BookingReference)
            .IsUnique();

        modelBuilder.Entity<Business>()
            .HasMany(b => b.Offers)
            .WithOne(o => o.Business)
            .HasForeignKey(o => o.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Offer>()
            .HasMany(o => o.Slots)
            .WithOne(s => s.Offer)
            .HasForeignKey(s => s.OfferId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Offer>()
            .HasMany(o => o.Bookings)
            .WithOne(b => b.Offer)
            .HasForeignKey(b => b.OfferId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OfferSlot>()
            .HasMany(s => s.Bookings)
            .WithOne(b => b.Slot)
            .HasForeignKey(b => b.SlotId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
