/**
 * Module : HeadlessRunner.java Copyright : (c) 2011-2012, Galois, Inc.
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

import java.io.IOException;
import java.net.URISyntaxException;

import org.openqa.selenium.WebDriver;

import com.galois.fiveui.Result;
import com.galois.fiveui.drivers.Drivers;
import com.google.common.collect.ImmutableList;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.BasicConfigurator;

/**
 * The main entry point for running headless rule set runs.
 * <p>
 * The {@link #main(String[])} method of this class sets up a WebDriver, loads
 * a headless run description from disk, and executes the run which includes
 * loading seed URL's, performing a webcrawl, and running rule sets on each of
 * the crawled pages.
 * 
 * @author bjones
 * 
 */
public class HeadlessRunner {

	private static Logger logger = Logger.getLogger("com.galois.fiveui.HeadlessRunner");
	
    /**
     * @param args list of headless run description filenames
     * @throws IOException
     * @throws URISyntaxException
     */
    public static void main(final String[] args)
    	throws IOException, URISyntaxException {

    	// Configure logging output based on configuration in the
    	// programs.properties file
    	Level logLevel;
    	String logLevelProp = System.getProperty("LOG_LEVEL");
    	if (logLevelProp == "DEBUG") 
    		logLevel = Level.DEBUG;
    	else if (logLevelProp == "INFO") 
    		logLevel = Level.INFO;
    	else if (logLevelProp == "WARN") 
    		logLevel = Level.WARN;
    	else if (logLevelProp == "ERROR") 
        	logLevel = Level.ERROR;
    	else if (logLevelProp == "FATAL") 
            logLevel = Level.FATAL;
    	else
    		logLevel = Level.FATAL;
    	
    	BasicConfigurator.configure();
    	Logger rootLogger = Logger.getRootLogger();
    	rootLogger.setLevel(logLevel);
    	
    	// Process the command line arguments
        if (0 == args.length) {
            printHelp();
            System.exit(1);
        }
 
        for (int i = 0; i < args.length; i++) {
            String runDescFileName = args[i];
            logger.debug("parsing headless run description: " + args[i]);
            HeadlessRunDescription descr = HeadlessRunDescription.parse(runDescFileName);
            for (WebDriver driver : getDrivers()) {
            	logger.debug("invoking headless run...");
            	BatchRunner runner = new BatchRunner(driver);
                ImmutableList<Result> results = runner.runHeadless(descr);
                logger.debug("runHeadless returned " + results.size() + " results");
                System.out.println("\n=========================\n");
                System.out.println( "         RESULTS         \n");
                System.out.println( "=========================\n\n");
                for (Result result : results) {
                    System.out.println(result.toString()); // TODO add support for file output
                }
            	driver.quit();
            }
        }
    }

    /**
     * Build a list of webdrivers with which to run each ruleset.
     * 
     * @return list of initialized WebDriver objects
     */
    private static ImmutableList<WebDriver> getDrivers() {
    	logger.debug("building webdrivers ...");
        ImmutableList<WebDriver> r = ImmutableList.<WebDriver>of(
                  Drivers.buildFFDriver()
             // , Drivers.buildChromeDriver()
                );
        logger.debug("built: " + r.toString());
        return r;
    }

    private static void printHelp() {
        System.out.println(
                "Usage: HeadlessRunner [<runDescirption.json> ...]");
    }

}
