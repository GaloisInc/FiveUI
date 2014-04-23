using System.Runtime.Serialization;

/*
 * The Manifest class provides a type for serializing and deserializing
 * JSON rule set manifests.
 */
namespace FiveUI
{
    [DataContract]
    public class RuleSetMeta
    {
        [DataMember]
        public string manifestUrl { get; set; }

        [DataMember]
        public string[] rulePaths { get; set; }

        [DataMember]
        public string[] dependencies { get; set; }
    }
}
