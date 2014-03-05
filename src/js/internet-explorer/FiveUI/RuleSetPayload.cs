using System;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;

namespace FiveUI
{
    /*
     * This is the object that is injected into pages to run rules.
     */
    [DataContract]
    public class RuleSetPayload
    {

        [DataMember]
        public string[] rules { get; set; }

        [DataMember]
        public Dependency[] dependencies { get; set; }

        [DataContract]
        public class Dependency
        {

            [DataMember]
            public string content { get; set; }

            [DataMember]
            public string url { get; set; }

        }

    }

}
