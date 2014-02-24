using System;
using System.Collections.Generic;
using System.IO;
using System.Json;
using System.Linq;
using System.Net;
using System.Text;

namespace FiveUI
{
    public class RuleSet
    {
        public readonly Uri ManifestUrl;
        public readonly string Id;

        public string RulesDir
        {
            get { return FileStore.GetBucket(Id); }
        }

        // TODO: Also need Url pattern
        private RuleSet(Uri manifestUrl, string id)
        {
            ManifestUrl = manifestUrl;
            Id = id;
        }

        private RuleSet(Uri manifestUrl) : this(manifestUrl, Guid.NewGuid().ToString("N")) {}

        public static RuleSet Fetch(Uri manifestUrl)
        {
            var rs = new RuleSet(manifestUrl);
            rs.update();
            return rs;
        }

        public static RuleSet Load(string id)
        {
            var dir = FileStore.GetBucket(id);
            var url = getMeta(dir, "manifestUrl");
            if (!String.IsNullOrWhiteSpace(url))
            {
                return new RuleSet(new Uri(url), id);
            }
            else {
                return null;
            }
        }

        public static IEnumerable<RuleSet> LoadAll()
        {
            var buckets = FileStore.GetBuckets();
            return buckets
            .Select<string, RuleSet>((b) =>
            {
                var id = b.Split(Path.DirectorySeparatorChar).Last();
                return Load(id);
            })
            .Where((rs) => rs != null);
        }

        // Downloads latest manifest and rules.
        private void update()
        {
            var id  = Guid.NewGuid().ToString("N");
            var dir = FileStore.GetBucket(id);

            var manifestPath = Path.Combine(dir, "manifest.json");

            var client = new WebClient();
            client.DownloadFile(ManifestUrl, manifestPath);

            var manifestText = File.ReadAllText(manifestPath, new UTF8Encoding());
            var manifest     = JsonValue.Parse(manifestText);

            if (manifest.JsonType == JsonType.Object
                    && manifest.ContainsKey("rules")
                    && manifest["rules"].JsonType == JsonType.Array) {
                foreach (string ruleUrl in (JsonArray) manifest["rules"])
                {
                    fetchRule(ManifestUrl, dir, ruleUrl);
                }
            }

            setMeta(RulesDir, "manifestUrl", ManifestUrl.AbsoluteUri);
        }

        private static void fetchRule(Uri manifestUrl, string dir, string ruleUrl)
        {
            var url    = new Uri(manifestUrl, ruleUrl);
            var client = new WebClient();
            client.DownloadFile(url, urlToPath(dir, ruleUrl));  // TODO: use Async variant
        }

        private static string urlToPath(string baseDir, string url)
        {
            // TODO: handle URLs that are not relative paths
            var path = url.Replace('/', Path.DirectorySeparatorChar);
            return Path.Combine(baseDir, url);
        }

        private static string getMeta(string dir, string key)
        {
            var data = readMeta(dir);
            return (string) data[key];
        }

        private static void setMeta(string dir, string key, string val)
        {
            var data = readMeta(dir);
            data[key] = val;
            writeMeta(dir, data);
        }

        private static JsonObject readMeta(string dir)
        {
            var path = Path.Combine(dir, "META");
            var text = File.Exists(path) ? File.ReadAllText(dir, new UTF8Encoding()) : null;
            var data = text != null ? JsonValue.Parse(text) : null;
            if (data.JsonType == JsonType.Object) {
                return (JsonObject) data;
            }
            else
            {
                return new JsonObject(new KeyValuePair<String, JsonValue>[0]);
            }
        }

        private static void writeMeta(string dir, JsonObject content)
        {
            var path = Path.Combine(dir, "META");
            File.WriteAllText(path, content.ToString(), new UTF8Encoding());
        }

        public override bool Equals(object other)
        {
            if (other == null)
            {
                return false;
            }

            RuleSet rs = other as RuleSet;
            if ((object) rs == null)
            {
                return false;
            }

            return Equals(rs);
        }

        public bool Equals(RuleSet other)
        {
            if (other == null)
            {
                return false;
            }
            return (ManifestUrl == other.ManifestUrl) && (Id == other.Id);
        }

        public override int GetHashCode()
        {
            unchecked  // Overflow is fine, just wrap.
            {
                int hash = 67;
                hash = hash * 41 + ManifestUrl.GetHashCode();
                hash = hash * 41 + Id.GetHashCode();
                return hash;
            }
        }
    }
}
