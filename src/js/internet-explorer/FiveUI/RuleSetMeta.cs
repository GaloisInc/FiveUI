using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;

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

        public static RuleSetMeta Parse(Stream json)
        {
            var s = new DataContractJsonSerializer(typeof(RuleSetMeta));
            return s.ReadObject(json) as RuleSetMeta;
        }

        public static void Serialize(Stream output, RuleSetMeta meta)
        {
            var s = new DataContractJsonSerializer(typeof(RuleSetMeta));
            s.WriteObject(output, meta);
        }
    }
}
