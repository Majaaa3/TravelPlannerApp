namespace TripService.Models
{
    public class Destination
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public DateTime ArrivalDate { get; set; }
        public DateTime DepartureDate { get; set; }
        public string Description { get; set; }
        public int TripId { get; set; }
        public Trip Trip { get; set; }
    }
}