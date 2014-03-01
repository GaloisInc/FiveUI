using System;
using System.Runtime.InteropServices;

namespace FiveUI
{
    [ComVisible(true),
     Guid("77B1A0B7-D016-4F10-B261-67A41B9B4EB9"),
     InterfaceType(ComInterfaceType.InterfaceIsDual)]
    public interface IComputePort
    {
        [DispId(1)]
        int TestMsg(string msg);
    }
}
