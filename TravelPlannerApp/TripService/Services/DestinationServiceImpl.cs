using Microsoft.EntityFrameworkCore;
using TripService.Data;
using TripService.DTOs;
using TripService.Models;

namespace TripService.Services
{
    public class DestinationServiceImpl : IDestinationService
    {
        private readonly AppDbContext _context;

        public DestinationServiceImpl(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<DestinationDto>> GetDestinationsByTrip(int tripId)
        {
            return await _context.Destinations
                .Where(d => d.TripId == tripId)
                .Select(d => MapToDto(d))
                .ToListAsync();
        }

        public async Task<DestinationDto> GetDestination(int id)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null)
                throw new Exception("Destination not found.");
            return MapToDto(destination);
        }

        public async Task<DestinationDto> CreateDestination(CreateDestinationDto dto)
        {
            if (dto.DepartureDate < dto.ArrivalDate)
                throw new Exception("Departure date cannot be before arrival date.");

            var destination = new Destination
            {
                Name = dto.Name,
                Location = dto.Location,
                ArrivalDate = dto.ArrivalDate,
                DepartureDate = dto.DepartureDate,
                Description = dto.Description,
                TripId = dto.TripId
            };

            _context.Destinations.Add(destination);
            await _context.SaveChangesAsync();
            return MapToDto(destination);
        }

        public async Task<DestinationDto> UpdateDestination(int id, CreateDestinationDto dto)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null)
                throw new Exception("Destination not found.");

            if (dto.DepartureDate < dto.ArrivalDate)
                throw new Exception("Departure date cannot be before arrival date.");

            destination.Name = dto.Name;
            destination.Location = dto.Location;
            destination.ArrivalDate = dto.ArrivalDate;
            destination.DepartureDate = dto.DepartureDate;
            destination.Description = dto.Description;

            await _context.SaveChangesAsync();
            return MapToDto(destination);
        }

        public async Task DeleteDestination(int id)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null)
                throw new Exception("Destination not found.");
            _context.Destinations.Remove(destination);
            await _context.SaveChangesAsync();
        }

        private static DestinationDto MapToDto(Destination d) => new DestinationDto
        {
            Id = d.Id,
            Name = d.Name,
            Location = d.Location,
            ArrivalDate = d.ArrivalDate,
            DepartureDate = d.DepartureDate,
            Description = d.Description,
            TripId = d.TripId
        };
    }
}