package com.galois.fiveui;

import com.google.common.base.Function;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

import org.apache.log4j.Logger;

public class CrawlParameters {
	
	private static Logger logger = Logger.getLogger("com.galois.fiveui.CrawlParameters");
	
	public int depth;
	public int maxFetch;
	public int politeness;
	public String match;
	public Function<String, Boolean> matchFcn;
	public Boolean doNotCrawl;
	
	/**
	 * Construct (parse) a crawl type object from a string description
	 * 
	 * A valid description is a whitespace separated list as follows:
	 * "<depth> <maxFetch> <politeness> <start>"
	 * where:
	 * <ol>
	 *   <li> (depth :: int) depth of the crawl </li>
	 *   <li> (maxFetch :: int) maximum number of pages to crawl </li>
	 *   <li> (politeness :: int) number of milliseconds between hits on same domain </li>
	 *   <li> (match :: String) glob pattern to match URLs </li>
	 *  </ol>
	 *  or the string "none" which is, in spirit, equivalent to "0 1 1000 *",
	 *  but in practice the webcrawl is skipped entirely in this case.
	 * 
	 * @param desc a string description of the crawl type
	 * @throws Exception 
	 */
	public CrawlParameters(String desc) {
		String[] l = desc.split("\\s+");
		if (desc == "none" || l.length != 4) {
			this.doNotCrawl = true;
			logger.debug("setting doNotCrawl = True");
			return;
		} else {	
			this.depth = Integer.parseInt(l[0]);
			this.maxFetch = Integer.parseInt(l[1]);
			this.politeness = Integer.parseInt(l[2]);
			this.match = l[3];
			this.doNotCrawl = false;
			this.matchFcn = compileMatchFcn(this.match);
			logger.debug("setting depth: " + this.depth);
			logger.debug("setting maxFetch: " + this.maxFetch);
			logger.debug("setting politeness: " + this.politeness);
			logger.debug("setting match: " + this.match);
		}
	}
	
	public static Function<String, Boolean> compileMatchFcn(String glob) {
		String reg = glob.replaceAll("\\.", "\\.").replaceAll("\\*", ".*");
		final Pattern pat = Pattern.compile(reg);
		return new Function<String, Boolean>() {
			public Boolean apply(String input) {
				Matcher m = pat.matcher(input);
				return m.matches();
			}
		};
	}
	
	public static CrawlParameters none() {
		return new CrawlParameters("none");
	}
	
	public Boolean isNone() {
		return this.doNotCrawl;
	}
}
