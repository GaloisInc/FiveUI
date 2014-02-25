using System;
using System.Collections.Generic;
using System.IO;
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
            var dir  = FileStore.GetBucket(id);
            var meta = readMeta(dir);
            if (meta != null && !String.IsNullOrWhiteSpace(meta.manifestUrl))
            {
                return new RuleSet(new Uri(meta.manifestUrl), id);
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

            Manifest manifest;
            using (var json = new FileStream(manifestPath, FileMode.Open, FileAccess.Read))
            {
                manifest = Manifest.Parse(json);
            }

            if (manifest.rules != null)
            {
                foreach (string ruleUrl in manifest.rules)
                {
                    fetchRule(ManifestUrl, dir, ruleUrl);
                }
            }

            writeMeta(RulesDir, new RuleSetMeta
            {
                manifestUrl = ManifestUrl.AbsoluteUri
            });
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

        private static RuleSetMeta readMeta(string dir)
        {
            var path = Path.Combine(dir, "META");
            if (File.Exists(path))
            {
                using (var json = new FileStream(path, FileMode.Open, FileAccess.Read))
                {
                    return RuleSetMeta.Parse(json);
                }
            }
            else
            {
                return null;
            }
        }

        private static void writeMeta(string dir, RuleSetMeta meta)
        {
            var path = Path.Combine(dir, "META");
            using (var json = new FileStream(path, FileMode.OpenOrCreate, FileAccess.Write))
            {
                RuleSetMeta.Serialize(json, meta);
            }
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
