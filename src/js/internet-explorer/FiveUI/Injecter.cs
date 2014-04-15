using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.Expando;  // provides IExpando
using System.Text.RegularExpressions;
using System.Windows.Forms;  // provides MessageBox
using mshtml;  // provides IHTMLDocument2
using SHDocVw;  // provides IWebBrowser2

namespace FiveUI
{
    public class Injecter
    {
        // TODO: persistence across sessions
        private OrderedDictionary persistentDict = new OrderedDictionary();

        public void execute(IWebBrowser2 browser, IHTMLDocument2 document)
        {
            var port = new Port();
            Attach<IPort>(document, "_fiveui_port", port);

            var ajax = new Ajax();
            Attach<IAjax>(document, "_fiveui_ajax", ajax);

            var storeDir = FileStore.GetBucket("key-value");
            var store = new Store(storeDir);
            Attach<IStore>(document, "_fiveui_store", store);

            port.on("require", resourcePath =>
            {
                var content = load(resourcePath);
                port.emit("resource."+ resourcePath, content);
            });

            inject(browser, load("injected/bootstrap.js"));
        }

        private bool Attach<T>(IHTMLDocument2 document, string propName, T api)
        {
            var windowEx = document.parentWindow as IExpando;
            if (windowEx.GetProperty(propName, BindingFlags.Default) == null)
            {
                var propInfo = windowEx.AddProperty(propName);
                propInfo.SetValue(windowEx, api);
                return true;
            }
            else {
                return false;
            }
        }

        // Loads embedded text resource from DLL.
        //
        // TODO: Throw exception & report error in browser if resource
        // is missing.
        private string load(string resource)
        {
            String text  = null;
            var manRef   = manifestResource(resource);
            var assembly = Assembly.GetExecutingAssembly();
            try
            {
                var stream = assembly.GetManifestResourceStream(manRef);
                var textStreamReader = new StreamReader(stream);
                text = textStreamReader.ReadToEnd();
            }
            catch (Exception e)
            {
                MessageBox.Show("Error loading "+ resource +": "+ e.ToString());
            }
            return text;
        }

        private string manifestResource(string path)
        {
            return "FiveUI.data." + path.Replace('/', '.');
        }

        private void inject(IWebBrowser2 browser, string code)
        {
            HTMLDocument document = (HTMLDocument) browser.Document;
            document.parentWindow.execScript(code);
        }

    }


}
