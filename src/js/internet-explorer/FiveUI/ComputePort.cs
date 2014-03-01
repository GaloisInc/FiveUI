using System;
using System.Reflection;  // provides BindingFlags
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.Expando;  // provides IExpando
using System.Windows.Forms;  // provides MessageBox
using mshtml;  // provides IHTMLDocument2
using SHDocVw;  // provides IWebBrowser2

namespace FiveUI
{
    [ComVisible(true),
     Guid("584FDA9C-AFD7-4CCD-AC6A-5B481B3D5931"),
     ClassInterface(ClassInterfaceType.None),
     ComDefaultInterface(typeof(IComputePort))]
    public class ComputePort : IComputePort
    {

        /* delegate int testMsg(string msg); */

        public static void test(IWebBrowser2 browser, IHTMLDocument2 document)
        {
            /* var window   = document.parentWindow; */
            var windowEx = document.parentWindow as IExpando;
            if (windowEx.GetProperty("ComputePort", BindingFlags.Default) == null)
            {
                var propInfo = windowEx.AddProperty("ComputePort");
                propInfo.SetValue(windowEx, new ComputePort());
            }
        }

        public int TestMsg(string msg)
        {
            MessageBox.Show("got message: "+ msg.ToString());
            return 3;
        }

    }
}
