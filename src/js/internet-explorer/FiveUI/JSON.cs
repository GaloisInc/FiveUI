using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;

namespace FiveUI
{

    public class JSON
    {

        public static T Parse<T>(Stream json) where T : class
        {
            var s = new DataContractJsonSerializer(typeof(T));
            return s.ReadObject(json) as T;
        }

        public static T Parse<T>(string json) where T : class
        {
            var bytes = new UTF8Encoding().GetBytes(json);
            using (Stream input = new MemoryStream(bytes))
            {
                return Parse<T>(input);
            }
        }

        public static void Serialize<T>(Stream output, T obj)
        {
            var s = new DataContractJsonSerializer(typeof(T));
            s.WriteObject(output, obj);
        }

        public static string Stringify<T>(T obj)
        {
            using (MemoryStream output = new MemoryStream())
            {
                Serialize(output, obj);
                return new UTF8Encoding().GetString(output.ToArray());
            }
        }

    }

}

