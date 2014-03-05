using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
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
            var port = new Port();
            Port.Attach(document, port);

            var appScripts = platformScripts()
                .Concat(computeScripts())
                .Concat(uiScripts());

            foreach (string s in appScripts)
            {
                if (s.EndsWith(".js"))
                {
                    inject(browser, load(s));
                }
            }

            foreach (RuleSet rs in RuleSet.LoadAll())
            {
                port.emit("SetRules", JSON.Stringify(rs.GetPayload()));
            }
        }

        private List<string> platformScripts() {
            var list = new List<string>();
            list.Add("injected/platform-compute.js");
            list.Add("injected/platform-ui.js");
            return list;
        }

        private List<string> computeScripts() {
            var list = new List<string>();
            list.Add("underscore.js");
            list.Add("jquery/jquery-1.8.3.js");
            list.Add("md5.js");
            list.Add("injected/prelude.js");
            list.Add("injected/compute.js");
            return list;
        }

        private List<string> uiScripts() {
            var list = new List<string>();
            list.Add("underscore.js");
            list.Add("font-awesome/css/font-awesome.css");
            list.Add("css/ui.css");
            list.Add("jquery/bundled.css");
            list.Add("jquery/jquery-1.8.3.js");
            list.Add("jquery/jquery-ui-1.9.2.custom.js");
            list.Add("injected/injected.css");
            list.Add("injected/prelude.js");
            list.Add("injected/ui.js");
            list.Add("injected/jquery-plugins.js");
            return list;
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

        private string load(string script)
        {
            var manRef   = manifestResource(script);
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
