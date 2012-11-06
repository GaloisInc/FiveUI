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

    public BatchRunner(WebDriver driver) {
        _driver = driver;
        _exe = (JavascriptExecutor) _driver;
    }

    public ImmutableList<Result> runTests(ImmutableList<RuleTest> build) {
        Builder<Result> resBuilder = ImmutableList.builder();
        for (RuleTest test : build) {
            resBuilder.addAll(runTest(test));
        }
        return resBuilder.build();
    }

    /**
     * Run a URITest, returning the result (success, failure details, or
     * indicator of exceptional conditions.)
     * 
     * @param test
     */
    public ImmutableList<Result> runTest(final RuleTest test) {
        RuleSet rule = test.getRule();
        
        ImmutableList<Result> rawResults;
        Builder<Result> builder = ImmutableList.builder();
        try {
            _driver.get(test.getUri().toString());
            rawResults = runRule(rule);
            
            List<ResType> oracle = Lists.newArrayList(test.getOracle());
            for (Result result : rawResults) {
                Result res;
                if ( oracle.remove(result.getType()) ) {
                    res = Result.pass(_driver,
                            test.getRuleId() + ": Got expected result: "+result.getType());
                } else {
                    res = Result.error(_driver,
                            test.getRuleId() + ": Unexpected result: "+result);
                }
                builder.add(res);
            }
            for (ResType o : oracle) {
                Result res = Result.error(_driver, 
                        test.getRuleId() + ": missing expected result: "+o);
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

    private ImmutableList<Result> runRule(final RuleSet ruleSet) throws IOException {
        String contentScript = wrapRule(ruleSet);
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
     * Build up the complete content script needed to run the rule
     * 
     * @throws IOException
     */
    private String wrapRule(RuleSet ruleSet) throws IOException {
        String injected = "";
        injected += Utils.readFile(SEL_INJECTED_COMPUTE_JS);
        injected += Utils.readFile(J_QUERY_JS);
        injected += Utils.readFile(PRELUDE_JS);
        injected += Utils.readFile(MD5_JS);
        injected += Utils.readFile(JQUERY_PLUGIN_JS);
        injected += Utils.readFile(INJECTED_COMPUTE_JS);
        
        injected += "return fiveui.selPort.send('SetRules', " + ruleSet + ");";
        
        return injected;
    }
}
