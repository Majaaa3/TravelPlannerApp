namespace ActivityService.Models
{
    public class ChecklistItem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsCompleted { get; set; } = false;
        public int TripId { get; set; }
    }
}