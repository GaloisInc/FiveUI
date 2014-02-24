using System;
using System.Collections.Generic;
using System.IO;

namespace FiveUI
{
    public class FileStore
    {
        private const string Prefix = "FiveUI-settings";
        private static readonly Lazy<string> BaseDir = new Lazy<string>(() => GetBase());

        public static string GetBucket(string key)
        {
            string path = Path.Combine(BaseDir.Value, key);
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            return path;
        }

        public static IEnumerable<string> GetBuckets()
        {
            var dirs = Directory.GetDirectories(BaseDir.Value);
            return new HashSet<string>(dirs);
        }

        // IE usually runs in protected mode - which means that the
        // extension is only authorized to write to certain directories.
        // One of those is the internet cache.
        private static string GetBase()
        {
            // Guid value from http://msdn.microsoft.com/en-us/library/system.guid(v=vs.110).aspx
            Guid internetCache = new Guid("352481E8-33BE-4251-BA85-6007CAEDCF9D");
            string pathBuffer = null;

            var res = ProtectedMode.IEGetWriteableFolderPath(
                    ref internetCache, ref pathBuffer);
            if (0 != res)  // Hopefully this means success.
            {
                throw new InvalidOperationException(res.ToString());
            }
            //else {
            //    GetTempFileName(CW2CT(pathBuffer), _T("bob"), 0, szTempFile);
            //    CoTaskMemFree(pathBuffer);
            //    szTempFile now has the full path of the temp file

            //}

            return Path.Combine(pathBuffer, Prefix);
        }

    }
}
