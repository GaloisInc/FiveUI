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
import com.google.common.collect.Lists;

/**
 * BatchRunner is initialized with a WebDriver object. It provides an interface
 * for running {@code RuleSet}s and {@code RuleTest}s with the WebDriver.
 * 
 * @see #runTest
 * @see #runRule
 * @author creswick
 */
public class BatchRunner {

    private final WebDriver _driver;
    private final JavascriptExecutor _exe;

    // Relative to the batch directory.
    private static final String DATA_DIR = "../contexts/data/";
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
     * @param driver the WebDriver object to run tests with
     */
    public BatchRunner(WebDriver driver) {
        _driver = driver;
        _exe = (JavascriptExecutor) _driver;
    }

    /**
     * Run a collection of RuleTests and return the concatenated results.
     * 
     * @param tests a list of RuleTest objects
     * @return a list of Result objects
     * @see #runTest
     */
    public ImmutableList<Result> runTests(ImmutableList<RuleTest> tests) {
        Builder<Result> resBuilder = ImmutableList.builder();
        for (RuleTest test : tests) {
            resBuilder.addAll(runTest(test));
        }
        return resBuilder.build();
    }

    /**
     * Run a RuleTest, returning the result (success, failure details, or
     * indicator of exceptional conditions.)
     * <p>
     * The test URI is loaded using the WebDriver and the rule set contained in
     * {@code test} is run.
     * <p>
     * For each result, look in the oracle collection for a corresponding ResType
     * (exception, pass, error, ...). If one is found, remove it from the oracle
     * and report that we got an expected result. If one is not found, report that
     * we got an unexpected result.
     * <p>
     * Finally, for each ResType left over in the oracle, report that we missed
     * an expected result.
     * <p>
     * Note: This method catches all exceptions generated during the rule run and
     * reports them as "exception" ResType results in its return value.
     * 
     * @param test a RuleTest to run
     */
    public ImmutableList<Result> runTest(final RuleTest test) {
        Rule rule = test.getRule();
        
        ImmutableList<Result> rawResults;
        Builder<Result> builder = ImmutableList.builder();
        try {
            loadURL(test.getUri().toString()); // set state of the WebDriver
            rawResults = runRule(rule); // run the ruleset, collect results
            
            List<ResType> oracle = Lists.newArrayList(test.getOracle());
            for (Result result : rawResults) {
                Result res;
                if ( oracle.remove(result.getType()) ) {
                    res = Result.pass(_driver,
                            test.getRuleName() + ": Got expected result: "+result.getType());
                } else {
                    res = Result.error(_driver,
                            test.getRuleName() + ": Unexpected result: "+result);
                }
                builder.add(res);
            }
            for (ResType o : oracle) {
                Result res = Result.error(_driver, 
                        test.getRuleName() + ": missing expected result: "+o);
                builder.add(res);
            }
        } catch (Exception e) {
            String errStr = "Could not run rule: " + rule.getName() + "\n";
            errStr += e.toString();
            rawResults = ImmutableList.of(
                    Result.exception(_driver, "Could not run rule: "+errStr));
            
            e.printStackTrace();
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
     * @param rule the rule to be run
     * @return results of running the rule set
     * @throws IOException
     */
    private ImmutableList<Result> runRule(final Rule rule) throws IOException {
        String contentScript = wrapRule(rule);
        Builder<Result> builder = ImmutableList.builder();

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
            builder.add(Result.exception(_driver, (String) res));
            return builder.build();
        } else {

            try {
                @SuppressWarnings({ "unchecked", "rawtypes" })
                List<Map<String, Map<String, String>>> results = (List) res;

                if (0 == results.size()) {
                    builder.add(Result.pass(_driver, "passed"));
                }

                for (Map<String, Map<String, String>> r : results) {
                    Map<String, String> problem = r.get("payload");
                    
                    builder.add(Result.error(_driver, problem.get("descr")));
                }

            } catch (ClassCastException e) {
                // An unexpected error happened:
                builder.add(Result.exception(_driver, "Unexpected object returned: "
                        + res));
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
     * @param rule a Rule object
     * @throws IOException
     */
    private String wrapRule(Rule rule) throws IOException {
        String injected = "";
        injected += Utils.readFile(SEL_INJECTED_COMPUTE_JS);
        injected += Utils.readFile(J_QUERY_JS);
        injected += Utils.readFile(PRELUDE_JS);
        injected += Utils.readFile(MD5_JS);
        injected += Utils.readFile(JQUERY_PLUGIN_JS);
        injected += Utils.readFile(INJECTED_COMPUTE_JS);
        
        injected += "return fiveui.selPort.send('SetRules', " + rule + ");";
        
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
