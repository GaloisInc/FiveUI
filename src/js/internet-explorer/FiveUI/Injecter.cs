using System;
using System.IO;
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

        private Assembly assembly;
        private StreamReader textStreamReader;

        public void execute(IWebBrowser2 browser)
        {
            var manifestUrl = manifestForLocation(browser);
            if (manifestUrl != null)
            {
                var ruleSet = RuleSet.Fetch(manifestUrl);
                MessageBox.Show("RulesDir: "+ ruleSet.RulesDir);

                //inject(browser, "alert('hello');");
                //inject(browser, load("test.js"));
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

        private string load(string script)
        {
            assembly = Assembly.GetExecutingAssembly();
            textStreamReader = new StreamReader(
                    assembly.GetManifestResourceStream("FiveUI."+ script)
                    );
            return textStreamReader.ReadToEnd();
        }

        private void inject(IWebBrowser2 browser, string code)
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
        }

    }


}
