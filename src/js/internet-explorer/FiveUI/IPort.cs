using System;
using System.Runtime.InteropServices;
using stdole;  // provides IDispatch

namespace FiveUI
{
    [ComVisible(true),
     Guid("9EBD8470-A894-4558-AC86-D43624BB3FBD"),
     InterfaceType(ComInterfaceType.InterfaceIsDual)]
    public interface IPort
    {
        void emit(string eventType, string data);
        void on(string eventType, IDispatch listener);
        void removeListener(string eventType, IDispatch listener);
        void once(string eventType, IDispatch listener);
    }
}
