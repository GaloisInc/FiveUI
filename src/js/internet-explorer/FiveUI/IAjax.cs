using System;
using System.Runtime.InteropServices;
using stdole;  // provides IDispatch

namespace FiveUI
{
    [ComVisible(true),
     Guid("F54546D7-ABD0-4D17-A785-437568F821DA"),
     InterfaceType(ComInterfaceType.InterfaceIsDual)]
    public interface IAjax
    {
        void get(string url, IDispatch success, IDispatch failure);
    }
}

