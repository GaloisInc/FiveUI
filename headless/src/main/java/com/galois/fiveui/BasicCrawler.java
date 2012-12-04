package com.galois.fiveui;

import edu.uci.ics.crawler4j.crawler.Page;
import edu.uci.ics.crawler4j.crawler.WebCrawler;
import edu.uci.ics.crawler4j.parser.HtmlParseData;
import edu.uci.ics.crawler4j.url.WebURL;

import java.util.List;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;

import com.google.common.base.Function;

/**
 * @author bjones
 */
public class BasicCrawler extends WebCrawler {

		private static Logger logger = Logger.getLogger("com.galois.fiveui.BasicCrawler");
        private final static Pattern FILTERS = Pattern.compile(
        		                                 ".*(\\.(css|js|bmp|gif|jpe?g"
                                               + "|png|tiff?|mid|mp2|mp3|mp4"
                                               + "|wav|avi|mov|mpeg|ram|m4v|pdf"
                                               + "|rm|smil|wmv|swf|wma|zip|rar|gz))$");
        public static Function<String, Boolean> _predicate;
        public static List<String> _urls;
        
        /**
         * Configure static properties of the class before a crawl.
         * 
         * @param pred URLs will be crawled only if pred.apply(URL) is
         *             true
         * @param urls reference to a list of strings which the crawler will
         *             append URLs to as it works
         */
        public static void configure(Function<String, Boolean> pred, List<String> urls) {
        	_predicate = pred;
        	_urls = urls;
        }
        
        /**
         * specify whether the given url should be crawled or not
         */
        @Override
        public boolean shouldVisit(WebURL url) {
                String href = url.getURL();
                Boolean yesno = !FILTERS.matcher(href).matches() && _predicate.apply(href);
                logger.debug("saying " + (yesno ? "yes" : "no") + " to " + href);
                return yesno;
        }

        /**
         * This function is called when a page is fetched and ready to be processed
         * by the program.
         */
        @Override
        public void visit(Page page) {
                int docid = page.getWebURL().getDocid();
                String url = page.getWebURL().getURL();
                String domain = page.getWebURL().getDomain();
                String path = page.getWebURL().getPath();
                String subDomain = page.getWebURL().getSubDomain();
                String parentUrl = page.getWebURL().getParentUrl();

                logger.debug(" - Docid: " + docid);
                logger.debug(" - URL: " + url);
                logger.debug(" - Domain: '" + domain + "'");
                logger.debug(" - Sub-domain: '" + subDomain + "'");
                logger.debug(" - Path: '" + path + "'");
                logger.debug(" - Parent page: " + parentUrl);

                if (page.getParseData() instanceof HtmlParseData) {
                        HtmlParseData htmlParseData = (HtmlParseData) page.getParseData();
                        String text = htmlParseData.getText();
                        String html = htmlParseData.getHtml();
                        List<WebURL> links = htmlParseData.getOutgoingUrls();

                        logger.debug(" -- Text length: " + text.length());
                        logger.debug(" -- Html length: " + html.length());
                        logger.debug(" -- Number of outgoing links: " + links.size());
                }
                logger.debug(" - =============");
                
                // append to URLs list
                if (null != _urls) {
                	_urls.add(url);
                }
        }
}
