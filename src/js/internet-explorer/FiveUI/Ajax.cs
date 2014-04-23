using System;
using System.Net;
using System.Reflection;  // provides BindingFlags
using System.Runtime.InteropServices;
using stdole;  // provides IDispatch

namespace FiveUI
{
    [ComVisible(true),
     Guid("B1CB276D-EEA7-4683-86D1-5EEF7EBDB9D4"),
     ClassInterface(ClassInterfaceType.None),
     ComDefaultInterface(typeof(IAjax))]
    public class Ajax : IAjax
    {
        public void get(string url, IDispatch success, IDispatch failure)
        {
            var client = new WebClient();
            try
            {
                var data = client.DownloadString(url);
                applyIDispatch(success, data);
            }
            catch (Exception e)
            {
                // TODO: send meaningful parameters on failure
                applyIDispatch(failure, "TODO");
            }
        }

        // Async implementation
        /* public void get(string url, IDispatch success, IDispatch failure) */
        /* { */
        /*     var client = new WebClient(); */
        /*     var task   = client.DownloadStringTaskAsync(url); */
        /*     task.ContinueWith(t => */
        /*     { */
        /*         if (t.Exception != null) */
        /*         { */
        /*             t.Exception.Handle(e => { */
        /*                     // TODO: send meaningful parameters on failure */
        /*                     applyIDispatch(failure, "TODO"); */
        /*                     return true; */
        /*                 }); */
        /*         } */
        /*         else { */
        /*             applyIDispatch(success, t.Result); */
        /*         } */
        /*     }); */
        /* } */

        // Based on:
        // http://bytes.com/topic/c-sharp/answers/655563-handling-javascript-functions-closures-passed-into-c-function
        private void applyIDispatch(IDispatch func, string data)
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
