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
    public class Manifest
    {
        [DataMember]
        public string name { get; set; }

        [DataMember]
        public string description { get; set; }

        [DataMember]
        public string[] rules { get; set; }

        public static Manifest Parse(Stream json)
        {
            var s = new DataContractJsonSerializer(typeof(Manifest));
            return s.ReadObject(json) as Manifest;
        }

        public static void Serialize(Stream output, Manifest manifest)
        {
            var s = new DataContractJsonSerializer(typeof(Manifest));
            s.WriteObject(output, manifest);
        }
    }
}
