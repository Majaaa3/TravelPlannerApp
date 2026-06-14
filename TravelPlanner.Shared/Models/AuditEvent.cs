using System.Runtime.Serialization;

namespace TravelPlanner.Shared.Models
{
    [DataContract]
    public class AuditEvent
    {
        [DataMember]
        public string Message { get; set; }

        [DataMember]
        public DateTime Timestamp { get; set; }

        [DataMember]
        public string ServiceSource { get; set; }
    }
}