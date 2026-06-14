namespace ActivityService.DTOs
{
    public class ChecklistItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsCompleted { get; set; }
        public int TripId { get; set; }
    }
}