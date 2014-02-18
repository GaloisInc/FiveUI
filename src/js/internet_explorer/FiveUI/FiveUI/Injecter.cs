using System;
using System.Text.RegularExpressions;
using System.Windows.Forms;  // provides MessageBox
using mshtml;
using SHDocVw;  // provides IWebBrowser2

namespace FiveUI
{
    public class Injecter
    {

        // TODO: get these values from settings
        private string manifestUrl =
            "http://localhost:8000/guidelines/wikipedia/wikipedia.json";
        private Regex urlPattern =
            new Regex(@"^http.*://.*\.wikipedia\.org/wiki/.*$", RegexOptions.IgnoreCase);

        public void execute(IWebBrowser2 browser)
        {
            var manifest = manifestForLocation(browser);
            if (manifest != null)
            {
                MessageBox.Show("MATCH!  MATCH!  MATCH!");
            }
        }

        private string manifestForLocation(IWebBrowser2 browser)
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

    }


}
