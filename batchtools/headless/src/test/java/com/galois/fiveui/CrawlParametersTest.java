package com.galois.fiveui;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import com.galois.fiveui.CrawlParameters;


public class CrawlParametersTest {

	private static Logger logger = Logger.getLogger("com.galois.fiveui.CrawlParameters");
	
	@BeforeClass
	public static void before() {
		//if (!Logger.getRootLogger().getAllAppenders().hasMoreElements())
		BasicConfigurator.configure();
		logger.info("running unit tests...");
	}
	
	@AfterClass
	public static void after() {
		LogManager.shutdown();
	}
	
	@Test
	public void testConstructorFields() {
		CrawlParameters c;
		try {
			c = new CrawlParameters("0 1 100 foo");
		} catch (Exception e) {
			Assert.assertTrue("failed to parse crawl type string", false);
			return;
		}
		Assert.assertArrayEquals(new int[]{0, 1, 100}, new int[]{c.depth, c.maxFetch, c.politeness});
		Assert.assertEquals("foo", c.match);
	}
	
	@Test
	public void testNone() {
		CrawlParameters c = CrawlParameters.none();
		Assert.assertTrue(c.isNone());
	}
	
	@Test
	public void testMatchFcn() {
		CrawlParameters c;
		try {
			c = new CrawlParameters("0 1 100 foo");
		} catch (Exception e) {
			Assert.assertTrue("failed to parse crawl type string", false);
			return;
		}
		Assert.assertTrue("failed to match foo", c.matchFcn.apply("foo"));
		Assert.assertFalse("failed to not match bar", c.matchFcn.apply("bar"));
	}
	
	@Test
	public void testMatchFcnGlob1() {
		CrawlParameters c;
		try {
			c = new CrawlParameters("0 1 100 foo*");
		} catch (Exception e) {
			Assert.assertTrue("failed to parse crawl type string", false);
			return;
		}
		Assert.assertTrue("failed to match foo", c.matchFcn.apply("foo"));
		Assert.assertFalse("failed to not match bar", c.matchFcn.apply("bar"));
		Assert.assertTrue("failed to match foobar", c.matchFcn.apply("foobar"));
		Assert.assertFalse("failed to not match barfoobar", c.matchFcn.apply("barfoobar"));
	}
	
	@Test
	public void testMatchFcnGlob2() {
		CrawlParameters c;
		try {
			c = new CrawlParameters("0 1 100 http://foo.com/*.html");
		} catch (Exception e) {
			Assert.assertTrue("failed to parse crawl type string", false);
			return;
		}
		Assert.assertTrue("failed to match http://foo.com/index.html", c.matchFcn.apply("http://foo.com/index.html"));
		Assert.assertTrue("failed to match http://foo.com/test/index.html", c.matchFcn.apply("http://foo.com/test/index.html"));
		Assert.assertFalse("failed to not match http://bar.com/index.html", c.matchFcn.apply("http://bar.com/index.html"));
	}
	
	@Test
	public void testMatchFcnGlob3() {
		CrawlParameters c;
		try {
			c = new CrawlParameters("0 1 100 *foo.com*");
		} catch (Exception e) {
			Assert.assertTrue("failed to parse crawl type string", false);
			return;
		}
		Assert.assertTrue("failed to match http://foo.com/index.html", c.matchFcn.apply("http://foo.com/index.html"));
		Assert.assertTrue("failed to match http://foo.com/test/index.html", c.matchFcn.apply("http://foo.com/test/index.html"));
		Assert.assertTrue("failed to match http://bar.foo.com", c.matchFcn.apply("http://bar.foo.com"));
		Assert.assertFalse("failed to not match http://foobar.com", c.matchFcn.apply("http://foobar.com"));
	}
	
}

