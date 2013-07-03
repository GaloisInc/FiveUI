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
package com.galois.fiveui.drivers;

import java.io.File;
import java.io.IOException;

import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;

/**
 * @author creswick
 * 
 */
public class Drivers {
    private static final String FIREFOX_BIN_PATH = "FIREFOX_BIN_PATH";
    private static final String CHROME_BIN_PATH = "CHROME_BIN_PATH";

    private static final String CD_BINARY_NAME = "chromedriver";
    private static final String CD_BASE_PATH = mkPath("..", "tools",
            "seleniumChromeDrivers");
    
    private static final String FIVEUI_ROOT_PATH = "FIVEUI_ROOT_PATH";
    private static final String defaultFiveuiRootPath = "../../../";
    private static final String firefoxProfilePath = "profiles/firefox";
    private static final String chromeProfilePath = "profiles/chrome";
    
    /**
     * Query the OS environment for the FiveUI root path, or return a default.
     */
    public static String getRootPath() {
    	String rootPath = System.getProperty(FIVEUI_ROOT_PATH);
    	return (null != rootPath) ? rootPath + File.separator : defaultFiveuiRootPath;
    }
    
    public static FirefoxDriver buildFFDriver(String ffProfile) {
        // Extracted into a method so we can set up profiles

    	String rootPath = getRootPath();
    	
        File profileDir = new File(ffProfile);
        FirefoxProfile profile = new FirefoxProfile(profileDir);
        

        String ffBinaryPath = System.getProperty(FIREFOX_BIN_PATH);

        FirefoxDriver driver;
        if (null == ffBinaryPath) {
            System.err
                    .println("WARNING: Running essentially random version of FireFox!");
            System.err.println("         set a path to firefox with -D"
                    + FIREFOX_BIN_PATH + "=<path to firefox>");
            driver = new FirefoxDriver(profile);
        } else {
            FirefoxBinary binary = new FirefoxBinary(new File(ffBinaryPath));
            driver = new FirefoxDriver(binary, profile);
        }

        return driver;
    }

    public static ChromeDriver buildChromeDriver() {
        
    	String rootPath = getRootPath();
    	
    	// set the chrome driver path:
        String chromeDriverPth =
                mkPath(CD_BASE_PATH, osNameArch(), CD_BINARY_NAME);
        System.setProperty("webdriver.chrome.driver", chromeDriverPth);

        // setting the path to chrome also seems to cause issues:
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--user-data-dir=" + rootPath + chromeProfilePath); // ,
                                                                    // "--enable-logging",
                                                                    // "--v=1");

        String chromeBinaryPath = System.getProperty(CHROME_BIN_PATH);
        if (null == chromeBinaryPath) {
            System.err
                    .println("WARNING: Running essentially random version of Chrome!");
            System.err.println("         set a path to Chrome with -D"
                    + CHROME_BIN_PATH + "=<path to chrome>");
        } else {
            options.setBinary(new File(chromeBinaryPath));
        }
        // For use with ChromeDriver:
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
