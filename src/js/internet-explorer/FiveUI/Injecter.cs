using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Windows.Forms;  // provides MessageBox
using mshtml;
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

        public void execute(IWebBrowser2 browser)
        {
            Func<string, bool> isJs = s => s.EndsWith(".js");
            Func<string, bool> run  = s => inject(browser, load(s));

            computeScripts().Where(isJs).Select(run);
            uiScripts().Where(isJs).Select(run);

                //inject(browser, "alert('hello');");
                //inject(browser, load("test.js"));
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
            var scriptRef = "FiveUI.data." + script.Replace('/', '.');
            var assembly = Assembly.GetExecutingAssembly();
            MessageBox.Show("loading: "+ scriptRef);
            var textStreamReader = new StreamReader(
                    assembly.GetManifestResourceStream("FiveUI.data."+ script)
                    );
            return textStreamReader.ReadToEnd();
        }

        private bool inject(IWebBrowser2 browser, string code)
        {
            HTMLDocument document = (HTMLDocument) browser.Document;
            IHTMLElement head = (IHTMLElement)((IHTMLElementCollection)
                    document.all.tags("head")).item(null, 0);
            IHTMLScriptElement scriptObject =
                (IHTMLScriptElement)document.createElement("script");
            /* scriptObject.type = "text/javascript"; */
            //scriptObject.async = true;  // TODO: async?
            scriptObject.text = code;
            ((HTMLHeadElement)head).appendChild((IHTMLDOMNode)scriptObject);
            // TODO: can I remove after script is processed?
            ((HTMLHeadElement)head).removeChild((IHTMLDOMNode)scriptObject);
            return true;
        }

    }


}
