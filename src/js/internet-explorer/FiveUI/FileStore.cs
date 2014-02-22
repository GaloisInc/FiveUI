using System;
using System.Runtime.InteropServices;  // provides DllImport

namespace FiveUI
{
    public class FileStore
    {
        public static string getBucket()
        {
            // Guid value from http://msdn.microsoft.com/en-us/library/system.guid(v=vs.110).aspx
            Guid internetCache = new Guid("352481E8-33BE-4251-BA85-6007CAEDCF9D");
            string pathBuffer = null;

            var res = ProtectedMode.IEGetWriteableFolderPath(
                    ref internetCache, ref pathBuffer);
            if (true /* SUCCEEDED(hr) */)
            {
                //GetTempFileName(CW2CT(pathBuffer), _T("bob"), 0, szTempFile);
                //CoTaskMemFree(pathBuffer);
                // szTempFile now has the full path of the temp file

                string path = String.Copy(pathBuffer);
                return path;
            }
            else
            {
                throw new InvalidOperationException(res.ToString());
            }
        }

    }
}
