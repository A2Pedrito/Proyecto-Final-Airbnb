using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Infrastructure.Persistence
{
    /// Representa la sesión con la base de datos y gestiona las entidades del dominio.
    public class AppDbContext : DbContext
    {
        /// Inicializa una nueva instancia del contexto de base de datos con las opciones dadas.
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        /// Representa la tabla de usuarios registrados en el sistema.
        public DbSet<User> Users { get; set; }
        /// Representa la tabla de propiedades o alojamientos publicados.
        public DbSet<Property> Properties { get; set; }
        /// Representa la tabla de fechas bloqueadas para la disponibilidad de las propiedades.
        public DbSet<BlockedDate> BlockedDates { get; set; }
        /// Representa la tabla de reservas realizadas por los huéspedes.
        public DbSet<Booking> Bookings { get; set; }
        /// Representa la tabla de reseñas dejadas por los huéspedes tras sus estadías.
        public DbSet<Review> Reviews { get; set; }
        /// Representa la tabla de notificaciones del sistema para los usuarios.
        public DbSet<Notification> Notifications { get; set; }

        /// Configura el modelo de la base de datos, relaciones y restricciones mediante Fluent API.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                // Requiere que el correo sea obligatorio y único en la base de datos.
                entity.Property(u => u.Email).IsRequired();
                entity.HasIndex(u => u.Email).IsUnique();
            });

            modelBuilder.Entity<Property>(entity =>
            {
                // Configura la relación donde una propiedad pertenece a un anfitrión (Host).
                entity.HasOne(p => p.Host)
                      .WithMany()
                      .HasForeignKey(p => p.HostId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<BlockedDate>(entity =>
            {
                // Configura la relación de fechas bloqueadas vinculadas a una propiedad específica.
                entity.HasOne(b => b.Property)
                      .WithMany()
                      .HasForeignKey(b => b.PropertyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Booking>(entity =>
            {
                // Configura la relación de la reserva con la propiedad, restringiendo su eliminación.
                entity.HasOne(b => b.Property)
                      .WithMany()
                      .HasForeignKey(b => b.PropertyId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Configura la relación de la reserva con el huésped, restringiendo su eliminación.
                entity.HasOne(b => b.Guest)
                     .WithMany()
                     .HasForeignKey(b => b.GuestId)
                     .OnDelete(DeleteBehavior.Restrict);

                // Establece que las reservas se crean por defecto en estado "Confirmada".
                entity.Property(b => b.Status)
                      .HasDefaultValue(BookingStatus.Confirmed);
            });

            modelBuilder.Entity<Review>(entity =>
            {
                // Configura la relación de la reseña con la reserva que la originó.
                entity.HasOne(r => r.Booking)
                      .WithMany()
                      .HasForeignKey(r => r.BookingId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Añade una restricción en la base de datos para que la calificación sea entre 1 y 5.
                entity.ToTable(t => t.HasCheckConstraint(
                    "CK_Review_Rating", "Rating >= 1 AND Rating <= 5"));

                // Configura la relación de la reseña con la propiedad calificada.
                entity.HasOne(r => r.Property)
                      .WithMany()
                      .HasForeignKey(r => r.PropertyId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Configura la relación de la reseña con el huésped que la escribió.
                entity.HasOne(r => r.Guest)
                      .WithMany()
                      .HasForeignKey(r => r.GuestId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                // Configura la relación de la notificación con el usuario destinatario.
                entity.HasOne(n => n.User)
                      .WithMany()
                      .HasForeignKey(n => n.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Configura el valor por defecto de creación usando el timestamp actual en MySQL.
                entity.Property(n => n.CreatedAt)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            });

        }
    }
}