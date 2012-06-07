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
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.google.common.collect.ImmutableList;

/**
 * @author creswick
 * 
 */
public class BatchExecutor {

    private static final ImmutableList<WebDriver> DRIVERS = ImmutableList.of(
            Drivers.buildFFDriver(), Drivers.buildChromeDriver());

    /**
     * @param args
     * @throws IOException
     * @throws URISyntaxException
     */
    public static void main(final String[] args)
            throws IOException, URISyntaxException {
        
        for (int i = 0; i < args.length; i++) {
            String runDescFile = args[i];
            RunDescription descr = RunDescription.parse(runDescFile);

            for (WebDriver driver : DRIVERS) {
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
    
    private static ImmutableList<Result> invokeTest(RunDescription descr,
            WebDriver driver) throws IOException {
        BatchRunner runner = new BatchRunner(driver);

        return runner.runTests(descr.getTests());

    }
}
