using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

using Key = System.String;
using Val = System.String;

namespace FiveUI
{
    [ComVisible(true),
     Guid("FED81562-6FA3-4B1E-A2D9-AB5643938FBC"),
     ClassInterface(ClassInterfaceType.None),
     ComDefaultInterface(typeof(IStore))]
    public class Store : IStore
    {
        private readonly Encoding utf8 = new UTF8Encoding();
        private readonly string storeDir;

        public Store(string storeDir)
        {
            this.storeDir = storeDir;
        }

        public Key key(int idx)
        {
            var files = getFiles();
            if (idx >= 0 && idx < files.Length)
            {
                return fromPath(files[idx]);
            }
            else
            {
                return null;
            }
        }

        public Val getItem(Key key)
        {
            var path = getPath(key);
            if (File.Exists(path))
            {
                return File.ReadAllText(path, utf8);
            }
            else
            {
                return null;
            }
        }

        public void setItem(Key key, Val val)
        {
            var path = getPath(key);
            File.WriteAllText(path, val, utf8);
        }

        public void removeItem(Key key)
        {
            var path = getPath(key);
            File.Delete(path);
        }

        public void clear()
        {
            foreach (string path in getFiles())
            {
                File.Delete(path);
            }
        }

        public int size()
        {
            var files = getFiles();
            return files.Length;
        }

        private string[] getFiles()
        {
            return Directory.GetFiles(storeDir);
        }

        private string getPath(Key key)
        {
            var fileName = encode(key);
            return Path.Combine(storeDir, fileName);
        }

        private string fromPath(string path)
        {
            var fileName = Path.GetFileName(path);
            return decode(fileName);
        }

        private string encode(string input)
        {
            var bytes = utf8.GetBytes(input);
            return Convert.ToBase64String(bytes);
        }

        private string decode(string input)
        {
            var bytes = Convert.FromBase64String(input);
            return utf8.GetString(bytes);
        }
    }
}
