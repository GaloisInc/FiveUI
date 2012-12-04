package com.galois.fiveui;

import java.util.ArrayList;
import java.util.List;

import com.google.common.base.Function;

import edu.uci.ics.crawler4j.crawler.CrawlConfig;
import edu.uci.ics.crawler4j.crawler.CrawlController;
import edu.uci.ics.crawler4j.fetcher.PageFetcher;
import edu.uci.ics.crawler4j.robotstxt.RobotstxtConfig;
import edu.uci.ics.crawler4j.robotstxt.RobotstxtServer;

/**
 * @author bjones
 */
public class BasicCrawlerController {

	private String seed;
	private String tmpDir;
	private int depth;
	private int maxFetch;
	private int politeness;
	private int threads;
	private Function<String, Boolean> predicate;
	
	/**
	 * Initialize a basic web crawler controller.
	 * 
	 * @param seed URL to start the crawl
	 * @param domain string that all crawled page URLs must start with
	 * @param depth maximum depth to crawl
	 * @param maxFetch maximum number of pages to crawl
	 * @param politeness time in milliseconds to wait before making requests on same domain
	 * @param threads number of concurrent threads to use while crawling
	 * @param tmpDir temporary directory to store intermediate crawl data
	 *               (must exist and be read/write before crawl starts)
	 */
	public BasicCrawlerController (String seed, final String domain, int depth, int maxFetch,
			                       int politeness, int threads, String tmpDir) {
		this.seed = seed;
		this.predicate = new Function<String, Boolean>() {
			public Boolean apply(String s) {
				return s.startsWith(domain);
			}
		};
		this.depth = depth;
		this.maxFetch = maxFetch;
		this.politeness = politeness;
		this.threads = threads;
		this.tmpDir = tmpDir;
	}
	
	/**
	 * Initialize a basic web crawler controller.
	 * 
	 * @param seed URL to start the crawl
	 * @param pred a Function<String, Boolean> to be used as a predicate that all crawled URLs must pass
	 * @param depth maximum depth to crawl
	 * @param maxFetch maximum number of pages to crawl
	 * @param politeness time in milliseconds to wait before making requests on same domain
	 * @param threads number of concurrent threads to use while crawling
	 * @param tmpDir temporary directory to store intermediate crawl data
	 *               (must exist and be read/write before crawl starts)
	 */
	public BasicCrawlerController (String seed, Function<String, Boolean> pred, int depth, int maxFetch,
            int politeness, int threads, String tmpDir) {
		this.seed = seed;
		this.predicate = pred;
		this.depth = depth;
		this.maxFetch = maxFetch;
		this.politeness = politeness;
		this.threads = threads;
		this.tmpDir = tmpDir;
	}
	
	public List<String> go() throws Exception {

		/*
		 * crawlStorageFolder is a folder where intermediate crawl data is
		 * stored.
		 */
		String crawlStorageFolder = this.tmpDir;

		/*
		 * numberOfCrawlers shows the number of concurrent threads that should
		 * be initiated for crawling.
		 */
		int numberOfCrawlers = this.threads;

		CrawlConfig config = new CrawlConfig();

		config.setCrawlStorageFolder(crawlStorageFolder);

		/*
		 * Be polite: Make sure that we don't send more than 1 request per
		 * second (1000 milliseconds between requests).
		 */
		config.setPolitenessDelay(this.politeness);

		/*
		 * You can set the maximum crawl depth here. The default value is -1 for
		 * unlimited depth
		 */
		config.setMaxDepthOfCrawling(this.depth);

		/*
		 * You can set the maximum number of pages to crawl. The default value
		 * is -1 for unlimited number of pages
		 */
		config.setMaxPagesToFetch(this.maxFetch);
		
		/*
		 * Delete the temporary crawl storage after we're done.
		 */
		config.setResumableCrawling(false);
		
		/*
		 * Instantiate the controller for this crawl.
		 */
		PageFetcher pageFetcher = new PageFetcher(config);
		RobotstxtConfig robotstxtConfig = new RobotstxtConfig();
		RobotstxtServer robotstxtServer = new RobotstxtServer(robotstxtConfig, pageFetcher);
		CrawlController controller = new CrawlController(config, pageFetcher, robotstxtServer);

		// add a seed URL
		controller.addSeed(this.seed);

		/*
		 * Setup storage for data collection by the BasicCrawler class
		 */
		List<String> store = new ArrayList<String>();
		BasicCrawler.configure(this.predicate, store);
		
		/*
		 * Start the crawl. This is a blocking operation.
		 */
		try {
			controller.start(BasicCrawler.class, numberOfCrawlers);
		} finally {
			controller.Shutdown();
		}
		
		/*
		 * Extract and return data collected by BasicCrawler
		 */
		return store;
	}
}
