using System;
using System.Collections.Specialized;
using System.Runtime.InteropServices;

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
        private readonly OrderedDictionary dict;

        public Store(OrderedDictionary dict)
        {
            this.dict = dict;
        }

        public Key key(int idx)
        {
            if (idx >= 0 && idx < dict.Count)
            {
                String[] keys = new String[dict.Count];
                dict.Keys.CopyTo(keys, 0);
                return keys[idx];
            }
            else
            {
                return null;
            }
        }

        public Val getItem(Key key)
        {
            return (dict.Contains(key) ? dict[key] : null) as string;
        }

        public void setItem(Key key, Val val)
        {
            dict[key] = val;
        }

        public void removeItem(Key key)
        {
            dict.Remove(key);
        }

        public void clear()
        {
            dict.Clear();
        }

        public int size()
        {
            return dict.Count;
        }
    }
}
