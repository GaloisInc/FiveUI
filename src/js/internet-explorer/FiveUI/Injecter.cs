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

        // TODO: get these values from settings
        private Uri manifestUrl =
            new Uri("http://10.0.2.2:8000/guidelines/wikipedia/wikipedia.json");
        private Regex urlPattern =
            new Regex(@"^http.*://.*\.wikipedia\.org/wiki/.*$", RegexOptions.IgnoreCase);

        // TODO: persistence across sessions
        private OrderedDictionary persistentDict = new OrderedDictionary();

        public void execute(IWebBrowser2 browser, IHTMLDocument2 document)
        {
            var manifest = manifestForLocation(browser);
            if (manifest == null)
            {
                return;
            }

            var port = new Port();
            Attach<IPort>(document, "_fiveui_port", port);

            var ajax = new Ajax();
            Attach<IAjax>(document, "_fiveui_ajax", ajax);

            var store = new Store(persistentDict);
            Attach<IStore>(document, "_fiveui_store", store);

            // TODO: Clears and fetches rules on every request for
            // development purposes.
            foreach (RuleSet rs in RuleSet.LoadAll())
            {
                RuleSet.Remove(rs.Id);
            }
            var ruleSet = RuleSet.Fetch(manifest);

            port.on("Go", data =>
            {
                inject(browser, load("js/jetpack-shim.js"));
                inject(browser, load("js/main.js"));
                /* inject(browser, "fiveui.firefox.main();"); */
            });

            /* port.on("Again", data => */
            /* { */
            /*     var ruleSet = RuleSet.Fetch(manifest); */
            /*     port.emit("log", "\"sending rules\""); */
            /*     port.emit("SetRules", JSON.Stringify(ruleSet.GetPayload())); */
            /* }); */

            port.on("require", resourcePath =>
            {
                port.emit("log", "\"request for: "+ resourcePath +"\"");
                var content = load(resourcePath);
                port.emit("log", "\"emitting: resource."+ resourcePath +"\"");
                port.emit("resource."+ resourcePath, content);
            });

            /* port.on("GetRuleSets", data => */
            /* { */
            /*     foreach (RuleSet ruleSet in RuleSet.LoadAll()) { */
            /*         port.emit("RuleSetResponse", JSON.Stringify(ruleSet.GetPayload())); */
            /*     } */
            /* }); */
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
