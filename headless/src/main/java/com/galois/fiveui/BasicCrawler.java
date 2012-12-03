package com.galois.fiveui;

import edu.uci.ics.crawler4j.crawler.Page;
import edu.uci.ics.crawler4j.crawler.WebCrawler;
import edu.uci.ics.crawler4j.parser.HtmlParseData;
import edu.uci.ics.crawler4j.url.WebURL;

import java.util.List;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;

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
        public static String _starts = "";
        public static List<String> _urls;
        
        /**
         * Configure static properties of the class before a crawl.
         * 
         * @param starts URLs will be crawled only if url.startsWith(starts)
         *               true
         * @param urls   reference to a list of strings which the crawler will
         *               append URLs to as it works
         */
        public static void configure(String starts, List<String> urls) {
        	_starts = starts;
        	_urls = urls;
        }
        
        /**
         * specify whether the given url should be crawled or not
         */
        @Override
        public boolean shouldVisit(WebURL url) {
                String href = url.getURL().toLowerCase();
                return !FILTERS.matcher(href).matches() && href.startsWith(_starts);
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
