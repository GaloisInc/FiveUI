package com.galois.fiveui;

import java.io.File;
import java.io.IOException;
import java.net.BindException;
import java.util.List;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import junit.framework.Assert;

import org.apache.log4j.Level;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.apache.log4j.BasicConfigurator;

import com.google.common.io.Files;

import edu.uci.ics.crawler4j.util.IO;

public class CrawlTest {
	
	// TODO need a system independent way of getting the resources path
	private static String resourceDir = "src/test/resources/crawlTest/";
	private static Logger logger = Logger.getLogger(CrawlTest.class);
	private static NanoHTTPD httpServer = null;
	
	@BeforeClass
	public static void setupCrawlTests() {
		// Set up a simple configuration that logs on the console.
    	BasicConfigurator.configure();
    	logger.setLevel((Level) Level.INFO);
	    
	    // start up local web server for crawl tests
		
		logger.info("Starting NanoHTTPD webserver in " + resourceDir + " on port 8080 ...");
		try {
			httpServer = new NanoHTTPD(8080, new File(resourceDir));
		} catch (BindException e) {
			logger.info("assuming that local web server is already running");
		} catch (IOException e1) {
			e1.printStackTrace();
			Assert.assertTrue("failed to start NanoHTTPD in resource directory", false);
		}
	}
	
	@AfterClass
	public static void teardown() {
		LogManager.shutdown();
		httpServer.stop();
	}
	
	// Requires Internet access
	@Test
	public void corpDotGaloisCrawlTest() {
		File tmpPath = Files.createTempDir();
		BasicCrawlerController con = 
				new BasicCrawlerController("http://corp.galois.com",
						                   "http://corp.galois.com", 
						                   2, 5, 1000, 1,
						                   tmpPath.getAbsolutePath());
		List<String> urls = null;
		try {
			urls = con.go();
			System.out.println(urls.toString());
		} catch (Exception e) {
			Assert.assertTrue("failed to complete webcrawl", false);
			e.printStackTrace();
		} finally {
			IO.deleteFolder(tmpPath);
		}
		
		Assert.assertEquals((urls != null) && (urls.size() == 5), true);
	}
	
	@Test
	public void testLocalCrawlDepth3one() {
		doLocalCrawlTest("http://localhost:8080/one.html", 3, 10, 9);
	}
	
	@Test
	public void testLocalCrawlDepth3two() {
		doLocalCrawlTest("http://localhost:8080/two.html", 3, 10, 3);
	}
	
	@Test
	public void testLocalCrawlDepth0one() {
		doLocalCrawlTest("http://localhost:8080/one.html", 0, 10, 1);
	}
	
	public void doLocalCrawlTest(String seed, int depth, int maxFetch, int oracle) {	

	    logger.info("Starting localCrawlTest ...");
	    logger.info("  seed " + seed + ", depth " + depth);
	    
	    File tmpPath = Files.createTempDir();
		BasicCrawlerController con = 
			new BasicCrawlerController(seed, "http", depth, maxFetch, 100, 1,
					                   tmpPath.getAbsolutePath());
		List<String> urls = null;
		try {
			logger.info("Starting webcrawl ...");
			urls = con.go();
			logger.info("RETURN -- " + urls.toString());
		} catch (Exception e) {
			e.printStackTrace();
			Assert.assertTrue("failed to run webcrawler", false);
		} finally {
			IO.deleteFolder(tmpPath);
		}
		
		// assert that we got oracle number of URLs
		Assert.assertTrue("got " + urls.size() + " URLs, expected " + oracle,
			(urls != null) && (urls.size() == oracle));
	}
}
