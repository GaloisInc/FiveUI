/**
 * Module : Result.java Copyright : (c) 2011-2012, Galois, Inc.
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

import org.openqa.selenium.WebDriver;

/**
 * A Result object encapsulates the result of running a rule set check on a URL
 * with a WebDriver. Results are organized into four categories:
 * <ol>
 *   <li> exception: an uncaught exception occurred while running the rule set</li>
 *   <li> pass: the expected result was returned</li>
 *   <li> error: an unexpected result was returned</li>
 *   <li> warning: a warning was returned, currently this type is unused</li>
 * </ol>
 */
public class Result {

    private ResType _type;
    private String _msg;
    private WebDriver _driver;
    private String _url;
    private String _ruleName;
	private String _ruleDesc;
	private String _prob;

	/**
	 * Construct a new result of one of the four types.
	 *
	 * @param type type of the result
	 * @param driver WebDriver that the result comes from
	 * @param msg any additional information from the rule runner
	 * @param url url
	 * @param ruleName rule name
	 * @param ruleDesc rule description
	 * @param prob problem description
	 */
    public Result(ResType type, WebDriver driver, String msg, String url,
    		       String ruleName, String ruleDesc, String prob) {
        super();
        _type = type;
        _msg = msg;
        _driver = driver;
        _url = url;
        _ruleName = ruleName;
        _ruleDesc = ruleDesc;
        _prob = prob;
    }

    /**
     * An information restricted version of the other public constructor. This
     * constructor does not include URL, rule, or problem information.
     */
    public Result(ResType type, WebDriver driver, String msg) {
        super();
        _type = type;
        _msg = msg;
        _driver = driver;
        _url = "";
        _ruleName = "";
        _ruleDesc = "";
        _prob = "";
    }

    /**********************************************************************************
     * Factory methods: these provide easy construction of restricted Result
     * types.
     */

    /**
     * Result constructor, returns an "exception" type result.
     *
     * @param driver WebDriver the result came from
     * @param res description of the result
     * @return a Result object
     */
    public static Result exception(WebDriver driver, String res) {
        return new Result(ResType.Exception, driver, res);
    }

    /**
      * Result constructor, returns a "pass" type result.
      *
      * @param driver WebDriver the result came from
      * @param res description of the result
      * @return a Result object
      */
    public static Result pass(WebDriver driver, String res) {
        return new Result(ResType.Pass, driver, res);
    }

    /**
        * Result constructor, returns an "error" type result.
        *
        * @param driver WebDriver the result came from
        * @param res description of the result
        * @return a Result object
        */
    public static Result error(WebDriver driver, String res) {
        return new Result(ResType.Error, driver, res);
    }

    /**
        * Result constructor, returns a "warning" type result.
        *
        * @param driver WebDriver the result came from
        * @param res description of the result
        * @return a Result object
        */
    public static Result warning(WebDriver driver, String res) {
        return new Result(ResType.Warning, driver, res);
    }

    /**********************************************************************************
     * Extractor methods
     */

    public ResType getType() {
        return _type;
    }

    public String getMsg() {
        return _msg;
    }

    public WebDriver getDriver() {
        return _driver;
    }

    public String getURL() {
        return _url;
    }

    public String getRuleName() {
        return _ruleName;
    }

    public String getRuleDesc() {
        return _ruleDesc;
    }

    public String getProblem() {
        return _prob;
    }

    /**
     * Stringify the result, returning the type, driver name, and
     * full description.
     */
    @Override
    public String toString() {
        return getType() + " - " + _driver.toString().split(":")[0] + ": "
             + _msg + "\n"
             + " |\\- " + _url + "\n"
             + " |\\_ "  + _ruleName + "\n"
             + " |\\_ " + _ruleDesc + "\n"
             + "  \\_ " + _prob;
    }
}
