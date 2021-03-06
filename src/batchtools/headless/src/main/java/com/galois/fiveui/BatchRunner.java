/**
 * Module : BatchRunner.java Copyright : (c) 2012, Galois, Inc.
 *
 * Maintainer : Stability : Provisional Portability: Portable
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package com.galois.fiveui;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import com.galois.fiveui.drivers.Drivers;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableList.Builder;
import com.google.common.collect.Maps;
import com.google.common.io.Files;

import edu.uci.ics.crawler4j.util.IO;
// System.out.* is old fashioned


/**
 * BatchRunner is initialized with a WebDriver object. It provides an interface
 * for running {@code RuleSet}s and {@code RuleTest}s with the WebDriver.
 *
 * @author bjones
 */
public class BatchRunner {

    private WebDriver _driver;
    private JavascriptExecutor _exe;
    private String _root; // FiveUI root directory

    private static Logger logger = Logger.getLogger("com.galois.fiveui.BatchRunner");
    
    private void registerDriver(WebDriver driver) {
    	logger.debug("registering new webdriver...");
    	this._driver = driver;
        this._exe = (JavascriptExecutor) driver;
        this._root = Drivers.getRootPath();
        logger.debug("root path for webdriver is " + _root);
    }

    public BatchRunner() {
    	logger.debug("initializing BatchRunner ...");
    }

    /**
     * Run a headless run description, returning the raw results: 'PASS' if
     * no inconsistencies were found, 'ERROR' for each inconsistency found,
     * 'EXCEPTION' for each uncaught exception.
     * <p>
     * The run.getURL() is loaded using the WebDriver and the rule set returned
     * by {@code run.getRule()} is run.
     *
     * @param run a headless run description object
     */
    public ImmutableList<Result> runHeadless(HeadlessRunDescription run) {
    	String seedUrl;
    	Builder<Result> builder = ImmutableList.builder(); // for results
        ImmutableList<Result> rawResults;
        CrawlParameters params = new CrawlParameters(run.getCrawlType());
        int politeness = params.toString().equals("none") ? 1000 : params.politeness;
        List<String> urls;
        
        //-    URL,     params, urls
        Map<String, Map<String, List<String>>> urlCache = Maps.newHashMap();

        for (HeadlessAtom a: run.getAtoms()) {
	        RuleSet rs = a.getRuleSet();
	        seedUrl = a.getURL();
	        logger.debug("setting seed URL for crawl: " + seedUrl);
	        urls = null;

	        /**************
	         * Gather URLs
	         **************/

	        if (params.isNone()) {
	        	urls = ImmutableList.of(seedUrl);
	        	logger.debug("skipping webcrawl");
	        } else if (urlCache.containsKey(seedUrl) &&
	        	       urlCache.get(seedUrl).containsKey(params.toString())) {
	        	logger.debug("retreiving urls list from cache");
	        	urls = urlCache.get(seedUrl).get(params.toString());
	        } else {
	        	File tmpPath = Files.createTempDir();
		        logger.debug("tmp directory for crawl data: " + tmpPath.toString());
		        logger.debug("starting webcrawl controller ...");
				BasicCrawlerController con =
						new BasicCrawlerController(seedUrl,
								                   params.matchFcn,
								                   params.depth, params.maxFetch,
								                   params.politeness,
								                   1, // TODO only one thread is currently supported
								                   tmpPath.getAbsolutePath());
				try {
					urls = con.go();
					logger.debug("adding urls list to cache");
					logger.debug("URLs: " + urls.toString());
					Map<String, List<String>> entry = (Map<String, List<String>>) new HashMap<String, List<String>>();
					entry.put(params.toString(), urls);
					urlCache.put(seedUrl, entry);
				} catch (Exception e) {
					String errStr = "failed to complete webcrawl of" + seedUrl + "\n";
		            errStr += e.toString();
		            builder.add(new Result(ResType.Exception, _driver, errStr, null, seedUrl,
		            		               rs.getName(), rs.getDescription(), ""));
		            logger.error(errStr);
		            continue;
				} finally {
					IO.deleteFolder(tmpPath); // does its own logging
				}
	        }

	        /***********************
	         * Drive the browser(s)
	         ***********************/

	        for (WebDriver driver: getDrivers(run.getFirefoxProfile())) {
	        	registerDriver(driver);
				for (String url: urls) {
					logger.info("loading " + url + " for ruleset run ...");
			        loadURL(url); // set state of the WebDriver (blocking)
			        try {
			        	logger.info("running ruleset \"" + rs.getName() + "\"");
			        	rawResults = runRule(rs); // run the ruleset, collect results
			            builder.addAll(rawResults);
			        } catch (Exception e) {
			            String errStr = "exception during runRule: " + rs.getName() + "\n";
			            errStr += e.toString();
			            builder.add(new Result(ResType.Exception, _driver, errStr, null, url,
         		               rs.getName(), rs.getDescription(), ""));
			            logger.error(errStr);
			        }
			        try {
			        	logger.debug("being polite for " + politeness + " millis...");
						Thread.sleep(politeness);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
				}
				driver.quit();
	        }
        }
        return builder.build();
    }

    /**
     * Run a rule set on the currently loaded page.
     * <p>
     * This method uses the web driver instance to run a rule set on the currently
     * loaded page. The webdriver injects javascript that
     * includes all the dependencies (JQuery, etc..) as well as the function which
     * executes the rule check. The method sleeps the thread for 1 second and
     * queries the results, which are then parsed and returned as a list of
     * Result objects.
     *
     * @param ruleSet the rule set to be run
     * @return results of running the rule set
     * @throws IOException
     */
    private ImmutableList<Result> runRule(final RuleSet ruleSet) throws IOException {
        String contentScript = wrapRule(ruleSet);
        Builder<Result> builder = ImmutableList.builder();
        String state = "url=" +  _driver.getCurrentUrl() +
                ", ruleSet=\"" + ruleSet.getName() + "\"";
        logger.debug("runRule: " + state);

        contentScript += "return fiveui.selPort.query('ReportProblem')";
        Object res =_exe.executeScript(contentScript);
        logger.debug("runRule: " + state);
        if (res.getClass() == String.class) {
            // we received an error via the expected mechanisms:
            logger.error("exception running rule: " + res);
            builder.add(new Result(ResType.Exception, _driver, "", null, _driver.getCurrentUrl(),
		               ruleSet.getName(), ruleSet.getDescription(), ""));
            return builder.build();
        } else {
            try {
                @SuppressWarnings({ "unchecked", "rawtypes" })
                List<Map<String, Map<String, Object>>> results = (List) res;

                if (0 == results.size()) {
                    builder.add(new Result(ResType.Pass, _driver,
                    		"passed " + ruleSet.getRules().size() + " tests", null,
                    		_driver.getCurrentUrl(), ruleSet.getName(), ruleSet.getDescription(), ""));
                }

                for (Map<String, Map<String, Object>> r : results) {
                    Map<String, Object> problem = r.get("payload");
                    // TODO decide what to extract from problem object and what
                    //      to do with it.
                    //
                    //      Probably we should just pass along the Map<String, String>
                    //      and let the reporter deal with it.
                    String ruleName  = (String) problem.get("name");
                    String ruleDescr = (String) problem.get("descr");
                    String msg       = (String) (problem.get("msg") != null ? problem.get("msg") : "");
                    String xpath     = (String) problem.get("xpath");
                    ResType severity = mapSeverity((Long) problem.get("severity"));
                    String problemAsHTML = "Rule Name: " + ruleName + " / "
                                         + "Rule Desc: " + ruleDescr + " / "
                                         + "XPath:     " + (String) problem.get("xpath");
                    builder.add(new Result(severity, _driver, msg, xpath,
                                           _driver.getCurrentUrl(),
                                           ruleName, ruleDescr,
                                           problemAsHTML));
                }

            } catch (ClassCastException e) {
                // An unexpected error happened:
            	logger.error("unexpected object returned: " + e.toString());
            	builder.add(new Result(ResType.Exception, _driver,
            			               "Unexpected object returned: " + res + ", state: " + state, null,
            			               _driver.getCurrentUrl(),
            			               ruleSet.getName(),
            			               ruleSet.getDescription(),
            			               ""));
            }
        }
        return builder.build();
    }

    /**
     * Build up the complete content script needed to run the rule.
     * <p>
     * The string returned contains all the javascript dependencies required
     * to run a rule set and the function that is injected into the page which
     * executes the rule set.
     *
     * TODO DRY
     *
     * @param ruleSet a RuleSet object
     * @throws IOException
     */
    private String wrapRule(RuleSet ruleSet) throws IOException {
        String injected = "fiveui = {};";
        Class<? extends BatchRunner> cl = this.getClass();
        
        try {
            injected += Utils.readStream(cl.getResourceAsStream("/lib/jquery/jquery.js"));
            injected += Utils.readStream(cl.getResourceAsStream("/lib/underscore.js"));
            injected += Utils.readStream(cl.getResourceAsStream("/lib/md5.js"));
            injected += Utils.readStream(cl.getResourceAsStream("/fiveui/injected/prelude.js"));
            injected += Utils.readStream(cl.getResourceAsStream("/fiveui/injected/jquery-plugins.js"));
            injected += Utils.readStream(cl.getResourceAsStream("/selenium/selenium-injected-compute.js"));        
            injected += Utils.readStream(cl.getResourceAsStream("/fiveui/injected/compute.js"));
        } catch (NullPointerException e) {
            logger.error("Could not access javascript resources");
            throw e;
        }
        
        if (null != ruleSet.getDependencies()) {
        	for (String dep : ruleSet.getDependencies()) {
        		injected += Utils.readFile(dep);
        	}
        }
        
        String ruleStrList = ruleSet.toJS();
        String cmd = "fiveui.selPort.send('ForceEval', " + ruleStrList + ");";

        return injected + cmd;
    }
    
    /**
     * Build a list of webdrivers with which to run each ruleset.
     *
     * @return list of initialized WebDriver objects
     */
    private static ImmutableList<WebDriver> getDrivers(String ffProfile) {
    	logger.debug("building webdrivers ...");
        ImmutableList<WebDriver> r = ImmutableList.<WebDriver>of(
                  Drivers.buildFFDriver(ffProfile)
                //, Drivers.buildChromeDriver()
                );
        logger.debug("built: " + r.toString());
        return r;
    }

    /**
     * Sets the state of the WebDriver by loading a given URL.
     *
     * @param url URL to load
     */
    private void loadURL(String url) {
    	_driver.get(url);
    }

    private static ResType mapSeverity(long sev) {
        ResType res;

        switch ((int) sev) {
            case 0: res = ResType.Error; break;
            case 1: res = ResType.Warning; break;
            default: res = ResType.Error; break;
        }

        return res;
    }
}
