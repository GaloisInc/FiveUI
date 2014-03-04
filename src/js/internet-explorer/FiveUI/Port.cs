using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;  // provides BindingFlags
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.Expando;  // provides IExpando
using System.Windows.Forms;  // provides MessageBox
using mshtml;  // provides IHTMLDocument2
using stdole;  // provides IDispatch

using Listener = stdole.IDispatch;
using ListSet = System.Collections.Generic.List<stdole.IDispatch>;
using ListMap = System.Collections.Generic.Dictionary<string, System.Collections.Generic.List<stdole.IDispatch>>;

namespace FiveUI
{
    [ComVisible(true),
     Guid("54E08F4C-10CC-470B-B62F-19E30A686F4B"),
     ClassInterface(ClassInterfaceType.None),
     ComDefaultInterface(typeof(IPort))]
    public class Port : IPort
    {

        private readonly ListMap listeners = new Dictionary<string, ListSet>();

        public static bool Attach(IHTMLDocument2 document, Port port)
        {
            var windowEx = document.parentWindow as IExpando;
            if (windowEx.GetProperty("port", BindingFlags.Default) == null)
            {
                var propInfo = windowEx.AddProperty("port");
                propInfo.SetValue(windowEx, port as IPort);
                return true;
            }
            else {
                return false;
            }
        }

        public void emit(string eventType, dynamic data)
        {
            if (!listeners.ContainsKey(eventType))
            {
                return;
            }

            // Get a copy of the list of listeners.
            var lists = listeners[eventType].ToList();

            foreach (Listener list in lists)
            {
                applyListener(list, data);
            }
        }

        public void on(string eventType, Listener listener)
        {
            if (!listeners.ContainsKey(eventType))
            {
                listeners[eventType] = new List<Listener>();
            }
            var lists = listeners[eventType];
            lists.Add(listener as Listener);
        }

        public void removeListener(string eventType, Listener listener)
        {
            if (!listeners.ContainsKey(eventType))
            {
                return;
            }

            var lists = listeners[eventType];
            listeners[eventType] =
                new List<Listener>(lists.Where(l => l != listener));
        }

        /* public void once(string eventType, Listener listener) */
        /* { */
        /*     Listener list = null; */
        /*     list = data => */
        /*     { */
        /*         removeListener(eventType, list); */
        /*         applyListener(listener, data); */
        /*     }; */
        /*     on(eventType, list); */
        /* } */

        private void applyListener(Listener listener, dynamic data)
        {
            try
            {
                // Based on:
                // http://bytes.com/topic/c-sharp/answers/655563-handling-javascript-functions-closures-passed-into-c-function
                listener.GetType().InvokeMember(
                        "",
                        BindingFlags.InvokeMethod,
                        null,
                        listener,
                        new object[] { data });
            }
            catch
            {
                // TODO
            }
        }

    }

}

