/**
 * Module : BatchExecutor.java Copyright : (c) 2011-2012, Galois, Inc.
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

import com.galois.fiveui.drivers.Drivers;
import com.google.common.collect.ImmutableList;

/**
 * The main entry point for testing Rule Sets.
 * 
 * 
 * @author creswick
 * 
 */
public class RuleSetTester {

    /**
     * @param args
     * @throws IOException
     * @throws URISyntaxException
     */
    public static void main(final String[] args) throws IOException,
            URISyntaxException {
        System.out.println(args.length);

        if (0 == args.length) {
            printHelp();
            System.exit(1);
        }

        for (int i = 0; i < args.length; i++) {
            String runDescFileName = args[i];
            RSTestDescription descr = RSTestDescription.parse(runDescFileName);

            for (WebDriver driver : getDrivers()) {
                try {
                    ImmutableList<Result> results = invokeTest(descr, driver);

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

    private static ImmutableList<WebDriver> getDrivers() {
        return ImmutableList.<WebDriver>of(
                  Drivers.buildFFDriver()
             // , Drivers.buildChromeDriver()
                );
    }

    private static void printHelp() {
        System.out.println(
                "Usage: RuleSetTester [<ruleSetTestDescirption.json>]");
    }

    private static ImmutableList<Result> invokeTest(RSTestDescription descr,
            WebDriver driver) throws IOException {
        BatchRunner runner = new BatchRunner(driver);

        return runner.runTests(descr.getTests());
    }
}
