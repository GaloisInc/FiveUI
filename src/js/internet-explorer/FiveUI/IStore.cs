using System;
using System.Runtime.InteropServices;

using Key = System.String;
using Val = System.String;

namespace FiveUI
{
    [ComVisible(true),
     Guid("D8210104-6D59-4A86-AF25-6A0BA3D4027D"),
     InterfaceType(ComInterfaceType.InterfaceIsDual)]
    public interface IStore
    {
        Key key(int idx);
        Val getItem(Key key);
        void setItem(Key key, Val val);
        void removeItem(Key key);
        void clear();
        int size();
    }
}



