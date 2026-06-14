namespace ActivityService.DTOs
{
    public class CreateExpenseDto
    {
        public string Name { get; set; }
        public string Category { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public int TripId { get; set; }
    }
}