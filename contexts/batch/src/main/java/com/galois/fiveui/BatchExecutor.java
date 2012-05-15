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

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collection;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.google.common.base.Predicate;
import com.google.common.collect.Collections2;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableList.Builder;
import com.google.common.collect.Lists;
import com.google.gson.Gson;

/**
 * @author creswick
 * 
 */
public class BatchExecutor {
//
//    private static final Predicate<String> isRuleSet = new Predicate<String>() {
//        public boolean apply(final String input) {
//            return input.endsWith(".json");
//        }
//    };
//
//    private static final Predicate<String> isUrl = new Predicate<String>() {
//        public boolean apply(final String input) {
//            return input.startsWith("http");
//        }
//    };

    /**
     * @param args
     * @throws IOException
     * @throws URISyntaxException 
     */
    public static void main(final String[] args) throws IOException, URISyntaxException {
        //Config conf = parseArgs(Lists.newArrayList(args));

        //System.out.println("Running tests with configuration:\n" + conf);

        Gson gson = new Gson();        
        Reader in = new InputStreamReader(new FileInputStream(args[0]));
        RunDescription descr = gson.fromJson(in, RunDescription.class);

//        Builder<URITest> testBuilder = ImmutableList.builder();
//        for (URI uri : conf.getTestUrls()) {
//            List<RuleSet> ruleSets =
//                    Lists.transform(readRuleSets(conf), RuleSet.PARSE);
//
//            for (RuleSet ruleSet : ruleSets) {
//                for (Rule rule : ruleSet.getRules()) {
//                    RuleSet newRS = new RuleSet(ruleSet.getName(), 
//                            ruleSet.getDescription(), ImmutableList.of(rule));
//                    URITest test = new URITest(uri, newRS);
//                    testBuilder.add(test);
//                }
//            }
//        }
//
        WebDriver driver = new FirefoxDriver();
        // WebDriver driver = new HtmlUnitDriver(true);
        ImmutableList<Result> results;
        try {
            BatchRunner runner = new BatchRunner(driver);

            results = runner.runTests(descr.getTests());
            
            for (Result result : results) {
                System.out.println(result);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            driver.close();
        }
    }
//
//    private static ImmutableList<String> readRuleSets(Config conf) {
//        Builder<String> contentBuilder = ImmutableList.builder();
//        for (String fileName : conf.getRuleSets()) {
//            try {
//                contentBuilder.add(Utils.readFile(fileName));
//            } catch (IOException e) {
//                System.err.println("could not read file: " + fileName);
//                e.printStackTrace();
//            }
//        }
//
//        return contentBuilder.build();
//    }
//
//    private static Config parseArgs(final ArrayList<String> args) {
//
//        Collection<String> ruleSets = Collections2.filter(args, isRuleSet);
//        Collection<String> rawUrls = Collections2.filter(args, isUrl);
//
//        Builder<URI> b = ImmutableList.builder();
//        for (String str : rawUrls) {
//            try {
//                b.add(new URI(str));
//            } catch (URISyntaxException e) {
//                System.err.println("Warning: Could not parse: " + str
//                        + " into URI: \n" + e);
//                System.err.println("         Discarding " + str + " as uri.");
//            }
//        }
//        return new Config(ImmutableList.copyOf(ruleSets), b.build());
//    }
}
