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

/**
 * The main entry point for running headless rule set runs.
 * <p>
 * The {@link #main(String[])} method of this class sets up a WebDriver, loads
 * a headless run description from disk, and executes the run which includes
 * loading URL's and running rule sets on their content.
 * 
 * @author bjones
 * 
 */
public class HeadlessRunner {

    /**
     * @param args
     * @throws IOException
     * @throws URISyntaxException
     */
    public static void main(final String[] args) throws IOException,
            URISyntaxException {

        if (0 == args.length) {
            printHelp();
            System.exit(1);
        }

        for (int i = 0; i < args.length; i++) {
            String runDescFileName = args[i];
            HeadlessRunDescription descr = HeadlessRunDescription.parse(runDescFileName);

            for (WebDriver driver : getDrivers()) {
                try {
                    ImmutableList<Result> results = invokeHeadlessRun(driver, descr);

                    for (Result result : results) {
                        System.out.println(result);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    driver.quit();
                }
            }
        }
    }

    /**
	 * Helper method for executing headless runs. This method runs a single
	 * HeadlessRunDescription and returns the list of results. If the file cannot
	 * be read, an empty list is returned.
	 *  
	 * @param driver webdrive to use for the run
	 * @param descr a headless run description object
	 */
	private static ImmutableList<Result> invokeHeadlessRun(WebDriver driver, HeadlessRunDescription descr) {
		BatchRunner runner = new BatchRunner(driver);  // setup the batch runner
		return runner.runHeadless(descr);              // execute the run
	}
    
    private static ImmutableList<WebDriver> getDrivers() {
        return ImmutableList.<WebDriver>of(
                  Drivers.buildFFDriver()
             // , Drivers.buildChromeDriver()
                );
    }

    private static void printHelp() {
        System.out.println(
                "Usage: HeadlessRunner [<runDescirption.json>]");
    }

}
