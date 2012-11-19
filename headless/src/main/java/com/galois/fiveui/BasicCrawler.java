package com.galois.fiveui;

import edu.uci.ics.crawler4j.crawler.Page;
import edu.uci.ics.crawler4j.crawler.WebCrawler;
import edu.uci.ics.crawler4j.parser.HtmlParseData;
import edu.uci.ics.crawler4j.url.WebURL;

import java.util.List;
import java.util.regex.Pattern;

/**
 * @author bjones
 */
public class BasicCrawler extends WebCrawler {

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
         * by your program.
         */
        @Override
        public void visit(Page page) {
                int docid = page.getWebURL().getDocid();
                String url = page.getWebURL().getURL();
                String domain = page.getWebURL().getDomain();
                String path = page.getWebURL().getPath();
                String subDomain = page.getWebURL().getSubDomain();
                String parentUrl = page.getWebURL().getParentUrl();

                System.out.println(" - Docid: " + docid);
                System.out.println(" - URL: " + url);
                System.out.println(" - Domain: '" + domain + "'");
                System.out.println(" - Sub-domain: '" + subDomain + "'");
                System.out.println(" - Path: '" + path + "'");
                System.out.println(" - Parent page: " + parentUrl);

                if (page.getParseData() instanceof HtmlParseData) {
                        HtmlParseData htmlParseData = (HtmlParseData) page.getParseData();
                        String text = htmlParseData.getText();
                        String html = htmlParseData.getHtml();
                        List<WebURL> links = htmlParseData.getOutgoingUrls();

                        System.out.println(" -- Text length: " + text.length());
                        System.out.println(" -- Html length: " + html.length());
                        System.out.println(" -- Number of outgoing links: " + links.size());
                }
                System.out.println(" - =============");
                
                // append to URLs list
                if (null != _urls) {
                	_urls.add(url);
                }
        }
}
