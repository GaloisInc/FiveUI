/**
 * Module : Reporter.java Copyright : (c) 2012, Galois, Inc.
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
 *
 * @author Benjamin Jones <bjones@galois.com>
 */
package com.galois.fiveui;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.googlecode.jatl.Html;

/**
 * Reporter is responsible for turning a list of results from a FiveUI run and
 * and generating various reports which summarize the results. The reports are
 * generated in HTML and returned as human readable strings by getSummaryPage(),
 * getURLPage(), and getRulePage(). The client is responsible for writing them
 * to .html files (or whatever).
 * 
 * @author bjones
 * 
 */
public class Reporter {

    /** see sortBy* and computeSummaryStats methods for map semantics */
    private final Map<String, List<Result>> _byURLMap;
    private final Map<String, List<Result>> _byRuleMap;
    private final Map<String, int[]> _statsByUrl;
    private final Map<String, int[]> _statsByRule;
    private Map<String, String> _ruleNameToDesc;
    private static String GLOBAL_CSS = "h1 { font-size: 150%; }"
            + "h2 { font-size: 110%; }"
            + "li { margin: 5 0 0 0; }"
            + "table { border: 1px solid grey; cellpadding: 5%; width: 100%; table-layout: fixed; }\n"
            + "th.numeric { width: 4em; }"
            + "td.pass-number{ text-align: right; color: green; }\n"
            + "td.error-number{ text-align: right; color: red; }\n"
            + "td.warning-number{ text-align: right; color: darkorange; }\n"
            + "td.text{ text-align: left; }\n" + "th { font-weight: bold; }\n"
            + "td, th { border: 1px solid grey; overflow: hidden; text-overflow: ellipsis; }\n"
            + ".hlRow { background: #EEEEEE; }\n"
            + ".regRow { background: #FFFFFF; }\n";

    /**
     * Construct a Reporter object. The constructor takes a list of results and
     * uses them to populate various maps used in reporting.
     * 
     * @param results
     *            a list of Result objects
     */
    public Reporter(List<Result> results) {
        this._byURLMap = sortByURL(results);
        this._byRuleMap = sortByRule(results);
        this._statsByUrl = computeSummaryStatsByUrl(results);
        this._statsByRule = computeSummaryStatsByRule(results);
        this._ruleNameToDesc = extractRuleDesc(results);
    }

    /**
     * Build the HTML markup for a summary page based on the precomputed map
     * this._statsByUrl.
     * 
     * @return String containing human-readable HTML representing a summary page
     */
    public String getSummary() {
        StringWriter summaryPage = new StringWriter();
        final Map<String, int[]> scopedMapByUrl  = this._statsByUrl;
        final Map<String, int[]> scopedMapByRule = this._statsByRule;
        Html page = new Html(summaryPage);
        page = makeHead(page, "Summary of Results");
        page = new Html(page) {
            {
                h1().text("Headless Run Summary").end();
                p();
                    ul();
                        li().a().href("byURL.html")
                            .text("Results organized by URL")
                        .end().end();
                        li().a().href("byRule.html")
                            .text("Results organized by Rule")
                        .end().end();
                    end();
                end();
                p();
                    div().id("stats");
                        makeSummaryStatsByUrl(scopedMapByUrl);
                    end();
                end();
                p();
                    div().id("stats");
                        makeSummaryStatsByRule(scopedMapByRule);
                    end();
                end();
                endAll();
                done();
            }

            Html makeSummaryStatsByUrl(Map<String, int[]> stats) {
                return makeSummaryStats("Unique URLs", "byURL.html", stats);
            }

            Html makeSummaryStatsByRule(Map<String, int[]> stats) {
                return makeSummaryStats("Rules", "byRule.html", stats);
            }

            /**
             * Report statistics on the headless run. Note, "pass" means the URL
             * passed all tests in the ruleset, but "fail" can be reported for
             * the same test on multiple offenders in the page.
             */
            Html makeSummaryStats(String title, String detailUrl, Map<String, int[]> stats) {
                int keycount = stats.size();
                int[] statsList;

                p();
                    h3().text(title +": ");
                        span().classAttr("number")
                            .text(String.valueOf(keycount))
                        .end();
                end().end();

                p();
                    table().id("stats-table");
                        thead();
                            tr();
                                th()                     .text("URL")    .end();
                                th().classAttr("numeric").text("Pass")   .end();
                                th().classAttr("numeric").text("Error")  .end();
                                th().classAttr("numeric").text("Warning").end();
                            end();
                        end();
                        tbody();
                int i = 0; // index for **alternate row highlighting**
                List<String> sortedKeys = Lists.newArrayList();
                sortedKeys.addAll(stats.keySet());
                Collections.sort(sortedKeys);
                for (String key : sortedKeys) {
                    statsList = stats.get(key);
                    tr().classAttr(i % 2 == 0 ? "hlRow" : "regRow");
                        td().classAttr("text")
                            .a().href(detailUrl+"#"+encode(key)).text(key).end()
                        .end();
                        td().classAttr("pass-number")
                            .text(String.valueOf(statsList[0])).end();
                        td().classAttr("error-number")
                            .text(String.valueOf(statsList[1])).end();
                        td().classAttr("warning-number")
                            .text(String.valueOf(statsList[2])).end();
                    end();
                    i++;
                }
                end(); // end <tbody>
                end(); // end <table>
                return end(); // end <p>
            }
        };
        return summaryPage.getBuffer().toString();
    }

    /**
     * Build the HTML markup for a report page sorted by URL.
     * 
     * @return String containing human-readable HTML representing a report page
     */
    public String getByURL() {
        StringWriter byURLPage = new StringWriter();
        final Map<String, List<Result>> scopedMap = this._byURLMap;
        Html page = new Html(byURLPage);
        page = makeHead(page, "Results sorted by URL");
        page = new Html(page) {
            {
                body();
                h1().text("Results by URL").end();
                ol();
                List<String> sortedKeys = Lists.newArrayList();
                sortedKeys.addAll(scopedMap.keySet());
                Collections.sort(sortedKeys);
                for (String url : sortedKeys) {
                    li().id(formatId(url))
                        .h2().a().href(url).text(url).end().end();
                        ul();
                    int i = 0;
                    for (Result r : scopedMap.get(url)) {
                        String cAttr = i % 2 == 0 ? "hlRow" : "regRow";

                        // format an individual Result for this url:
                        li().classAttr(cAttr).b().text(r.getRuleName()).end();
                        resultToHtml(this, r, cAttr);
                        end();
                        i++;
                    }
                    end();
                    end();
                }
                endAll();
                done();
            }

        };
        return byURLPage.getBuffer().toString();
    }

    
    
    /**
     * Build the HTML markup for a report page sorted by rule name.
     * 
     * @return String containing human-readable HTML representing a report page
     */
    public String getByRule() {
        StringWriter byRulePage = new StringWriter();
        final Map<String, List<Result>> scopedMap = this._byRuleMap;
        final Map<String, String> scopedRuleNameToDesc = this._ruleNameToDesc;
        Html page = new Html(byRulePage);
        page = makeHead(page, "Results sorted by rule");
        page = new Html(page) {
            {
                h1().text("Results by Rule").end();
                ul();
                List<String> sortedKeys = new ArrayList<String>();
                sortedKeys.addAll(scopedMap.keySet());
                Collections.sort(sortedKeys);
                for (String rule : sortedKeys) {
                    li().id(formatId(rule));
                    b().text(rule).end()
                            .text(": " + scopedRuleNameToDesc.get(rule));
                    ul();
                    int i = 0;
                    for (Result r : scopedMap.get(rule)) {
                        String cAttr = i % 2 == 0 ? "hlRow" : "regRow";
                        
                        li().classAttr(cAttr).b().text(r.getURL()).end();
                        resultToHtml(this, r, cAttr);
                        end();
                        i++;
                    }
                    end();
                    end();
                }
                endAll();
                done();
            }
        };
        return byRulePage.getBuffer().toString();
    }


    private void resultToHtml(Html html, Result r, String cAttr) {
        
        html.ul();
        html.li().b().text("Description:").end();
        html.text(r.getRuleDesc()).end();
        
        html.li().b().text("Message:").end();
        html.text(r.getMsg()).end();

        html.li().b().text("xpath:").end();
        html.text(r.getXpath()).end();
        
        html.li().b().text("Severity:").end();
        html.text(r.getType().toString()).end();
        
    	html.li().b().text("Browser:").end();
    	// unit tests use a null webdriver object
        if (null != r.getDriver()) {
        	html.text(r.getDriver().toString()).end();
        }
        
        html.li().b().text("Url:").end();
        html.a().href(r.getURL()).text(r.getURL()).end().end();

        html.end();
    }
    
    /**
     * Utility method to take all the reports and write them to standard file
     * names under a given directory.
     * 
     * @param dirName
     *            name of the directory where the reports should be written
     * @throws IOException
     */
    public void writeReportsToDir(String dirName) throws IOException {
        PrintWriter summaryFile = new PrintWriter(new FileWriter(dirName
                + File.separator + "summary.html"));
        PrintWriter byURLFile = new PrintWriter(new FileWriter(dirName
                + File.separator + "byURL.html"));
        PrintWriter byRuleFile = new PrintWriter(new FileWriter(dirName
                + File.separator + "byRule.html"));
        summaryFile.write(this.getSummary());
        summaryFile.close();
        byURLFile.write(this.getByURL());
        byURLFile.close();
        byRuleFile.write(this.getByRule());
        byRuleFile.close();
    }

    /** Private fields **/

    private Html makeHead(Html page, final String title) {
        return new Html(page) {
            {
                html();
                head();
                title().text(title).end();
                style().type("text/css").text(GLOBAL_CSS).end();
                end();
                body();
            }
        };
    }

    /**
     * Populate a Map<String, List<Result>> representing the results sorted by
     * URL.
     * 
     * @param results
     *            a list of results
     * @return a map representing the results sorted by URL.
     */
    private Map<String, List<Result>> sortByURL(List<Result> results) {
        /** map semantics: Map< url, [rule1, rule2, ...] > */
        Map<String, List<Result>> map = new HashMap<String, List<Result>>();
        String url;
        List<Result> list;
        for (Result r : results) {
            url = r.getURL();
            if (map.containsKey(url)) {
                list = map.get(url);
                list.add(r);
            } else {
                list = new ArrayList<Result>();
                list.add(r);
                map.put(url, list);
            }
        }
        return map;
    }

    /**
     * Populate a Map<String, List<Result>> representing the results sorted by
     * rule name.
     * 
     * @param results
     *            a list of results
     * @return a map representing the results sorted by rule name.
     */
    private Map<String, List<Result>> sortByRule(List<Result> results) {
        /** map semantics: Map< rule, [url1, url2, ...] > */
        Map<String, List<Result>> map = new HashMap<String, List<Result>>();
        String rule;
        List<Result> list;
        for (Result r : results) {
            rule = r.getRuleName();
            if (map.containsKey(rule)) {
                list = map.get(rule);
                list.add(r);
            } else {
                list = new ArrayList<Result>();
                list.add(r);
                map.put(rule, list);
            }
        }
        return map;
    }

    /**
     * Build a map of ruleName -> ruleDesc entries occurring in the given list
     * of results.
     * 
     * @param results
     *            a list of results
     * @return a map associating rule names to rule descriptions
     */
    private Map<String, String> extractRuleDesc(List<Result> results) {
        Map<String, String> assoc = new HashMap<String, String>();
        for (Result r : results)
            if (!assoc.containsKey(r.getRuleName()))
                assoc.put(r.getRuleName(), r.getRuleDesc());
        return assoc;
    }

    /**
     * Compute summary statistics from the results list. This includes number of
     * passes and fails for each URL checked.
     *
     * @param results
     *            a list of results
     * @return a map representing the results by URL.
     */
    private Map<String, int[]> computeSummaryStatsByUrl(List<Result> results) {
        return computeSummaryStats(results, new Function<Result, String>() {
            public String apply(Result result) {
                return result.getURL();
            }
        });
    }

    /**
     * Compute summary statistics from the results list. This includes number of
     * passes and fails for each rule checked.
     * 
     * @param results
     *            a list of results
     * @return a map representing the results by URL.
     */
    private Map<String, int[]> computeSummaryStatsByRule(List<Result> results) {
        return computeSummaryStats(results, new Function<Result, String>() {
            public String apply(Result result) {
                return result.getRuleName();
            }
        });
    }

    /**
     * Compute summary statistics from the results list.
     *
     * @param results
     *            a list of results
     * @param getKey
     *            a function that maps a result to a map key
     * @return a map representing the results counted according to an
     * arbitrary result property
     */
    private Map<String, int[]> computeSummaryStats(
            List<Result> results,
            Function<Result, String> getKey) {
        /** statsMap semantics: Map<url, {#pass, #error, #warn}> */
        Map<String, int[]> statsMap = new HashMap<String, int[]>();
        String key;
        int pass, error, warn;
        int[] statsList;

        for (Result result : results) {
            pass = error = warn = 0;
            key = getKey.apply(result);
            if (result.getType() == ResType.Pass) {
                pass = numberPassed(result);
            }
            else if (result.getType() == ResType.Error) {
                // each error result corresponds to one test
                error = 1;
            }
            else if (result.getType() == ResType.Warning) {
                warn = 1;
            }

            if (statsMap.containsKey(key)) {
                statsList = statsMap.get(key);
            } else {
                statsList = new int[] { 0, 0, 0 };
                statsMap.put(key, statsList);
            }
            statsList[0] += pass;
            statsList[1] += error;
            statsList[2] += warn;
        }
        return statsMap;
    }

    private Pattern numberPassedPattern = Pattern.compile("passed ([0-9]+) tests");

    private int numberPassed(Result result) {
        int pass = 0;
        Matcher m = numberPassedPattern.matcher(result.getMsg());
        if (m.find()) {
            // parseInt throws exception if parse fails
            pass = Integer.parseInt(m.group(1));
        }
        return pass;
    }

    private String formatId(String label) {
        // java.net.URLEncoder.encode encodes spaces as "+" instead of "%20".
        return label.replaceAll("\\s", "+");
    }

    private String encode(String in) {
        try {
            return URLEncoder.encode(in, "utf-8");
        }
        catch(UnsupportedEncodingException e) {
            return "";
        }
    }
}
