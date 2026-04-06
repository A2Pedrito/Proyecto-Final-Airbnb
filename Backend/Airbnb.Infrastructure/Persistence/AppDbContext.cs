using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<BlockedDate> BlockedDates { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Notification> Notifications { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(u => u.Email).IsRequired();
                entity.HasIndex(u => u.Email).IsUnique();
            });

            modelBuilder.Entity<Property>(entity =>
            {
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(p => p.HostId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<BlockedDate>(entity =>
            {
                entity.HasOne<Property>()
                      .WithMany()
                      .HasForeignKey(b => b.PropertyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasOne<Property>()
                      .WithMany()
                      .HasForeignKey(b => b.PropertyId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<User>()
                     .WithMany()
                     .HasForeignKey(b => b.GuestId)
                     .OnDelete(DeleteBehavior.Restrict);

                entity.Property(b => b.Status)
                      .HasDefaultValue(BookingStatus.Confirmed);
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasOne<Booking>()
                      .WithMany()
                      .HasForeignKey(r => r.BookingId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.ToTable(t => t.HasCheckConstraint(
                    "CK_Review_Rating","Rating >= 1 AND Rating <= 5"));

                entity.HasOne<Property>()
                      .WithMany()
                      .HasForeignKey(r => r.PropertyId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(r => r.GuestId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(n => n.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Property(n => n.CreatedAt)
                      .HasDefaultValueSql("UTC_TIMESTAMP()");
            });

        }
    }
}
