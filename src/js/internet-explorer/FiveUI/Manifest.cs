using System.Runtime.Serialization;

/*
 * The Manifest class provides a type for serializing and deserializing
 * JSON rule set manifests.
 */
namespace FiveUI
{
    [DataContract]
    public class Manifest
    {
        [DataMember]
        public string name { get; set; }

        [DataMember]
        public string description { get; set; }

        [DataMember]
        public string[] rules { get; set; }
    }
}
