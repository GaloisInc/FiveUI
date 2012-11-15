/**
 * Module : BatchRunner.java Copyright : (c) 2011-2012, Galois, Inc.
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
import java.util.List;
import java.util.Map;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableList.Builder;
import com.galois.fiveui.Result;
import com.galois.fiveui.RuleSet;
import com.galois.fiveui.Utils;
import com.galois.fiveui.drivers.Drivers;

/**
 * BatchRunner is initialized with a WebDriver object. It provides an interface
 * for running {@code RuleSet}s and {@code RuleTest}s with the WebDriver.
 * 
 * @author bjones
 */
public class BatchRunner {

    private final WebDriver _driver;
    private final JavascriptExecutor _exe;
    private final String _root; // FiveUI root directory

    // Hard coded JS files, relative to the FiveUI root directory.
    private static final String DATA_DIR = "contexts/data/";
    private static final String J_QUERY_JS = DATA_DIR
            + "lib/jquery/jquery-1.7.1.min.js";
    private static final String PRELUDE_JS = DATA_DIR
            + "fiveui/injected/prelude.js";
    private static final String MD5_JS = DATA_DIR
            + "lib/jshash/md5.js";
    private static final String JQUERY_PLUGIN_JS = DATA_DIR
            + "fiveui/injected/jquery-plugins.js";
    private static final String SEL_INJECTED_COMPUTE_JS = DATA_DIR + 
            "/fiveui/selenium/selenium-injected-compute.js";

    private static final String INJECTED_COMPUTE_JS = DATA_DIR + 
            "/fiveui/injected/fiveui-injected-compute.js";
    
    /**
     * BatchRunner constructor, stores the given WebDriver. 
     * 
     * TODO DRY
     *
     * @param driver the WebDriver object to run tests with
     */
    public BatchRunner(WebDriver driver) {
        _driver = driver;
        _exe = (JavascriptExecutor) _driver;
        _root = Drivers.getRootPath();
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
    public ImmutableList<Result> runHeadless(final HeadlessRunDescription run) {
        
    	Builder<Result> builder = ImmutableList.builder();
        ImmutableList<Result> rawResults;
        for (HeadlessAtom a: run.getAtoms()) {
	        RuleSet rs = a.getRuleSet();
	        try {
	            loadURL(a.getURL()); // set state of the WebDriver
	            rawResults = runRule(rs); // run the ruleset, collect results
	            builder.addAll(rawResults);
	        } catch (Exception e) {
	            String errStr = "Exception during runRule: " + rs.getName() + "\n";
	            errStr += e.toString();
	            builder.add(Result.exception(_driver, "Could not run rule: "+errStr));
	        }
        }
        return builder.build();
    }
    
    /**
     * Run a rule set on a page.
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
        
        _exe.executeScript(contentScript);
        
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e1) {
            e1.printStackTrace();
        }
        
        Object res = _exe.executeScript("return fiveui.selPort.query(type='ReportProblem')");
        
        if (res.getClass() == String.class) {
            // we received an error via the expected mechanisms:
            System.err.println("Exception running rule: " + res);
            builder.add(Result.exception(_driver, (String) res + ", state: " + state));
            return builder.build();
        } else {

            try {
                @SuppressWarnings({ "unchecked", "rawtypes" })
                List<Map<String, Map<String, String>>> results = (List) res;
                
                if (0 == results.size()) {
                    builder.add(Result.pass(_driver, "passed: " + state));
                }

                for (Map<String, Map<String, String>> r : results) {
                    Map<String, String> problem = r.get("payload");
                    
                    builder.add(Result.error(_driver, "problem: " + 
                                             problem.toString() +
                                             ", state: " + state));
                }

            } catch (ClassCastException e) {
                // An unexpected error happened:
                builder.add(Result.exception(_driver, "Unexpected object returned: "
                        + res + ", state: " + state));
                e.printStackTrace();
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
        String injected = "";
        injected += Utils.readFile(_root + SEL_INJECTED_COMPUTE_JS);
        injected += Utils.readFile(_root + J_QUERY_JS);
        injected += Utils.readFile(_root + PRELUDE_JS);
        injected += Utils.readFile(_root + MD5_JS);
        injected += Utils.readFile(_root + JQUERY_PLUGIN_JS);
        injected += Utils.readFile(_root + INJECTED_COMPUTE_JS);
        
        injected += "return fiveui.selPort.send('SetRules', " + ruleSet + ");";
        
        return injected;
    }
    
    /**
     * Sets the state of the WebDriver by loading a given URL.
     * 
     * @param url URL to load
     */
    private void loadURL(String url) {
    	_driver.get(url);
    }
}