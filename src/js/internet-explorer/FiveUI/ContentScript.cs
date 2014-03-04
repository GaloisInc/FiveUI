using System;
using System.Reflection;  // provides BindingFlags
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.Expando;  // provides IExpando
using System.Windows.Forms;  // provides MessageBox
using mshtml;  // provides IHTMLDocument2
//using SHDocVw;  // provides IWebBrowser2

/*
 * The IContentScript interface and ContentScript object are intended to
 * reproduce portions of the Jetpack API used to create Firefox addons.
 * In particular it implements ports.
 *
 * see https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Content_Scripts/using_port
 */
namespace FiveUI
{
    [ComVisible(true),
     Guid("584FDA9C-AFD7-4CCD-AC6A-5B481B3D5931"),
     ClassInterface(ClassInterfaceType.None),
     ComDefaultInterface(typeof(IContentScript))]
    public class ContentScript : IContentScript
    {

        private readonly Lazy<Port> myPort;
        
        public IPort port
        {
            get { return myPort.Value as IPort; }
        }

        public ContentScript()
        {
            myPort = new Lazy<Port>(() => new Port());
        }

        public static bool Attach(IHTMLDocument2 document, ContentScript cs)
        {
            var windowEx = document.parentWindow as IExpando;
            if (windowEx.GetProperty("self", BindingFlags.Default) == null)
            {
                var propInfo = windowEx.AddProperty("self");
                propInfo.SetValue(windowEx, cs as IContentScript);
                return true;
            }
            else {
                return false;
            }
        }
    }
}
