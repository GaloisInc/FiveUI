using System;
using System.Runtime.InteropServices;  // provides DllImport

namespace FiveUI
{
    public class ProtectedMode
    {
        // Returns an error code - codes are mapped by in the Win32Error enum.  Wherever that is.
        [DllImport("ieframe.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        public static extern int IEGetWriteableFolderPath(
                ref Guid clsidFolderID, ref string lppwstrPath);
    }
}
