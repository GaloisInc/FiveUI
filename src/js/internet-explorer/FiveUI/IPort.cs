using System;
using System.Runtime.InteropServices;

namespace FiveUI
{
    public delegate int Listener(dynamic data);

    [ComVisible(true),
     Guid("9EBD8470-A894-4558-AC86-D43624BB3FBD"),
     InterfaceType(ComInterfaceType.InterfaceIsDual)]
    public interface IPort
    {
        void emit(string eventType, dynamic data);
        void on(string eventType, Listener listener);
        void removeListener(string eventType, Listener listener);
        void once(string eventType, Listener listener);
    }
}
