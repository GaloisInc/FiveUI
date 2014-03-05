using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;  // provides BindingFlags
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.Expando;  // provides IExpando
using System.Windows.Forms;  // provides MessageBox
using mshtml;  // provides IHTMLDocument2
using stdole;  // provides IDispatch

using Listener = System.Tuple<stdole.IDispatch, FiveUI.Port.LambdaListener>;
using ListSet = System.Collections.Generic.List<System.Tuple<stdole.IDispatch, FiveUI.Port.LambdaListener>>;
using ListMap = System.Collections.Generic.Dictionary<string, System.Collections.Generic.List<System.Tuple<stdole.IDispatch, FiveUI.Port.LambdaListener>>>;

namespace FiveUI
{
    [ComVisible(true),
     Guid("54E08F4C-10CC-470B-B62F-19E30A686F4B"),
     ClassInterface(ClassInterfaceType.None),
     ComDefaultInterface(typeof(IPort))]
    public class Port : IPort
    {
        public delegate void LambdaListener(dynamic data);

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

        public void on(string eventType, IDispatch listener)
        {
            LambdaListener list = fromIDispatch(listener);
            on(eventType, list, listener);
        }

        public void on(string eventType, LambdaListener listener)
        {
            on(eventType, listener, null);
        }

        private void on(string eventType, LambdaListener lambdaList, IDispatch dispList)
        {
            Listener list = Tuple.Create<IDispatch, LambdaListener>(dispList, lambdaList);
            if (!listeners.ContainsKey(eventType))
            {
                listeners[eventType] = new List<Listener>();
            }
            var lists = listeners[eventType];
            lists.Add(list);
        }

        public void removeListener(string eventType, IDispatch listener)
        {
            if (!listeners.ContainsKey(eventType)) { return; }

            var lists = listeners[eventType];
            listeners[eventType] =
                new List<Listener>(lists.Where(l =>
                            l.Item1 != null && l.Item1 != listener));
        }

        public void removeListener(string eventType, LambdaListener listener)
        {
            if (!listeners.ContainsKey(eventType)) { return; }

            var lists = listeners[eventType];
            listeners[eventType] =
                new List<Listener>(lists.Where(l => l.Item2 != listener));
        }

        public void once(string eventType, IDispatch listener)
        {
            LambdaListener list = data =>
            {
                removeListener(eventType, listener);
                applyIDispatch(listener, data);
            };
            on(eventType, list, listener);
        }

        public void once(string eventType, LambdaListener listener)
        {
            LambdaListener list = null;
            list = data =>
            {
                removeListener(eventType, list);
                listener(data);
            };
            on(eventType, list, null);
        }

        private void applyListener(Listener listener, dynamic data)
        {
            try
            {
                listener.Item2(data);
            }
            catch
            {
                // TODO
            }
        }

        private LambdaListener fromIDispatch(IDispatch listener)
        {
            return data =>
            {
                applyIDispatch(listener, data);
            };
        }

        // Based on:
        // http://bytes.com/topic/c-sharp/answers/655563-handling-javascript-functions-closures-passed-into-c-function
        private void applyIDispatch(IDispatch func, dynamic data)
        {
            func.GetType().InvokeMember(
                    "",
                    BindingFlags.InvokeMethod,
                    null,
                    func,
                    new object[] { data });
        }

    }

}

