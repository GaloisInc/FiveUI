/**
 * Module : Drivers.java Copyright : (c) 2011-2012, Galois, Inc.
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

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;

/**
 * TODO refactor into a shared package that can be used by the testrunner as w
 *      well as the batch execution apps.
 * 
 * 
 * @author creswick
 * 
 */
public class Drivers {
    private static final String CD_BINARY_NAME = "chromedriver";
    private static final String CD_BASE_PATH = mkPath("..", "..", "tools",
            "seleniumChromeDrivers");

    private static final String CHROME_PROFILE = mkPath("..", "..", "profiles",
            "chrome");

    private static final String FF_PROFILE = mkPath("..", "..", "profiles",
            "firefox");
    
    public static WebDriver buildFFDriver() {
        // Extracted into a method so we can set up profiles

        File profileDir = new File(FF_PROFILE);
        FirefoxProfile profile = new FirefoxProfile(profileDir);
        FirefoxDriver driver = new FirefoxDriver(profile);

        return driver;
    }

    public static WebDriver buildChromeDriver() {
        // set the chrome driver path:
        String chromeDriverPth =
                mkPath(CD_BASE_PATH, osNameArch(), CD_BINARY_NAME);
        System.setProperty("webdriver.chrome.driver", chromeDriverPth);

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--user-data-dir="+CHROME_PROFILE);

        return new ChromeDriver(options);
    }

    private static String mkPath(String... components) {
        StringBuilder path = new StringBuilder();
        int remaining = components.length;
        for (String c : components) {
            path.append(c);
            remaining--;
            if (remaining != 0) {
                path.append(File.separator);
            }
        }

        return path.toString();
    }

    /**
     * Determine the name of the directory that the chromedriver is in, based on
     * os.name and os.arch.
     * 
     * @return The name of the directory containing 'chromedriver'
     */
    private static String osNameArch() {
        String rawOsName = System.getProperty("os.name").toLowerCase();
        String osName = rawOsName.substring(0, 3);
        boolean is64bit = System.getProperty("os.arch").indexOf("64") >= 0;

        if (osName.equals("lin")) {
            osName += is64bit ? "64" : "32";
        }
        return osName;
    }

}
