namespace SharingService.DTOs
{
    public class ShareTokenDto
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public int TripId { get; set; }
        public string AccessType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsActive { get; set; }
        public string QrCodeBase64 { get; set; }
    }
}