using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Remoting.Metadata.W3cXsd2001;  // provides SoapHexBinary
using System.Security.Cryptography;
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

        public IEnumerable<string> RuleFiles
        {
            get
            {
                return readManifest().rules.Select<string, string>((r) =>
                {
                    return rulePath(r);
                });
            }
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

        public static void Remove(string id)
        {
            FileStore.RemoveBucket(id);
        }

        public RuleSetPayload GetPayload()
        {
            var meta     = readMeta(RulesDir);
            var paths    = meta.rulePaths;
            var contents = new string[paths.Length];

            int i = 0;
            foreach (string path in paths)
            {
                contents[i] = File.ReadAllText(path);
            }

            return new RuleSetPayload
            {
                rules        = contents,
                dependencies = new RuleSetPayload.Dependency[0]  // TODO
            };
        }

        // Downloads latest manifest and rules.
        private void update()
        {
            var id  = Guid.NewGuid().ToString("N");
            var manifestPath = Path.Combine(RulesDir, "manifest.json");

            fetch(ManifestUrl, manifestPath);
            var manifest = readManifest();
            string[] paths;

            if (manifest.rules != null)
            {
                paths = new string[manifest.rules.Length];
                int i = 0;
                foreach (string ruleUrl in manifest.rules)
                {
                    paths[i] = fetchRule(ruleUrl);
                    i += 1;
                }
            }
            else {
                paths = new string[0];
            }

            writeMeta(RulesDir, new RuleSetMeta
            {
                manifestUrl  = ManifestUrl.AbsoluteUri,
                rulePaths    = paths,
                dependencies = new string[0]  // TODO
            });
        }

        private Manifest readManifest()
        {
            var manifestPath = Path.Combine(RulesDir, "manifest.json");
            using (var json = new FileStream(manifestPath, FileMode.Open, FileAccess.Read))
            {
                return JSON.Parse<Manifest>(json);
            }
        }

        private string fetchRule(string ruleUrl)
        {
            var url  = new Uri(ManifestUrl, ruleUrl);
            var path = rulePath(ruleUrl);
            fetch(url, path);
            return path;
        }

        private string rulePath(string ruleUrl)
        {
            return Path.Combine(RulesDir, urlToFile(ruleUrl));
        }

        private static void fetch(Uri url, string dest)
        {
            var client = new WebClient();
            var dir    = Directory.GetParent(dest);
            dir.Create();
            client.DownloadFile(url, dest);  // TODO: use Async variant
        }

        private static string urlToFile(string url)
        {
            var data = Encoding.UTF8.GetBytes(url);
            var hash = SHA1.Create().ComputeHash(data);
            var soap = new SoapHexBinary(hash);
            return soap.ToString();
        }

        private static RuleSetMeta readMeta(string dir)
        {
            var path = Path.Combine(dir, "META");
            if (File.Exists(path))
            {
                using (var json = new FileStream(path, FileMode.Open, FileAccess.Read))
                {
                    return JSON.Parse<RuleSetMeta>(json);
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
            using (var output = new FileStream(path, FileMode.OpenOrCreate, FileAccess.Write))
            {
                JSON.Serialize(output, meta);
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
