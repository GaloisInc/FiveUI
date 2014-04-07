using System;
using System.Collections.Generic;
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

        // TODO: get these values from settings
        private Uri manifestUrl =
            new Uri("http://10.0.2.2:8000/guidelines/wikipedia/wikipedia.json");
        private Regex urlPattern =
            new Regex(@"^http.*://.*\.wikipedia\.org/wiki/.*$", RegexOptions.IgnoreCase);

        public void execute(IWebBrowser2 browser, IHTMLDocument2 document)
        {
            var manifest = manifestForLocation(browser);
            if (manifest == null)
            {
                return;
            }

            var port = new Port();
            Attach<IPort>(document, "port", port);

            var ajax = new Ajax();
            Attach<IAjax>(document, "_fiveui_ajax", ajax);

            // TODO: Clears and fetches rules on every request for
            // development purposes.
            foreach (RuleSet rs in RuleSet.LoadAll())
            {
                RuleSet.Remove(rs.Id);
            }

            port.on("Go", data =>
            {
                var ruleSet = RuleSet.Fetch(manifest);

                inject(browser, load("js/jetpack-shim.js"));
                inject(browser, load("js/main.js"));
                inject(browser, "fiveui.firefox.main();");
            });

            port.on("Again", data =>
            {
                var ruleSet = RuleSet.Fetch(manifest);
                port.emit("log", "\"sending rules\"");
                port.emit("SetRules", JSON.Stringify(ruleSet.GetPayload()));
            });

            port.on("require", resourcePath =>
            {
                port.emit("log", "\"request for: "+ resourcePath +"\"");
                var content = load(resourcePath);
                port.emit("log", "\"emitting: resource."+ resourcePath +"\"");
                port.emit("resource."+ resourcePath, content);
            });
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

        private Uri manifestForLocation(IWebBrowser2 browser)
        {
            var document = browser.Document as IHTMLDocument2;
            var window   = document.parentWindow;

            var matcher  = urlPattern.Match((String) window.location.href);
            if (matcher.Success)
            {
                return manifestUrl;
            }
            else
            {
                return null;
            }
        }

        // Loads embedded text resource from DLL.
        //
        // TODO: Throw exception & report error in browser if resource
        // is missing.
        private string load(string resource)
        {
            var manRef   = manifestResource(resource);
            var assembly = Assembly.GetExecutingAssembly();
            var textStreamReader = new StreamReader(
                    assembly.GetManifestResourceStream(manRef)
                    );
            return textStreamReader.ReadToEnd();
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
