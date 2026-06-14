namespace SharingService.DTOs
{
    public class CreateShareTokenDto
    {
        public int TripId { get; set; }
        public string AccessType { get; set; } // "VIEW" ili "EDIT"
        public int ExpiresInDays { get; set; } = 7;
    }
}