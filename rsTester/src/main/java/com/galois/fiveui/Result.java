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

public class Result {

    public static Result exception(WebDriver driver, String res) {
        return new Result(ResType.Exception, driver, res);
    }
    
    public static Result pass(WebDriver driver, String res) {
        return new Result(ResType.Pass, driver, res);
    }
    
    public static Result error(WebDriver driver, String res) {
        return new Result(ResType.Error, driver, res);
    }

    public static Result warning(WebDriver driver, String res) {
        return new Result(ResType.Warning, driver, res);
    }
    
    private ResType _type;
    private String _desc;
    private WebDriver _driver;
    
    private Result(ResType type, WebDriver driver, String desc) {
        super();
        _type = type;
        _desc = desc;
        _driver = driver;
    }

    public ResType getType() {
        return _type;
    }

    public String getDesc() {
        return _desc;
    }
    
    public WebDriver getDriver() {
        return _driver;
    }

    @Override
    public String toString() {
        return getType() + " - " + _driver + ": " + getDesc();
    }
}