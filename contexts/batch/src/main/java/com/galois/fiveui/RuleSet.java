/**
 * Module : RuleSet.java Copyright : (c) 2011-2012, Galois, Inc.
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

import java.util.HashMap;
import java.util.List;

import org.openqa.selenium.htmlunit.HtmlUnitDriver;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.gson.Gson;

public class RuleSet {

    /**
     * Function wrapper around `RuleSet.parse` for use in `transform` and other
     * functional combinators.
     */
    public static final Function<String, RuleSet> PARSE =
            new Function<String, RuleSet>() {
                public RuleSet apply(String input) {
                    return RuleSet.parse(input);
                }
            };

    /**
     * Parse a string representation of a Rule Set into a Java POJO.
     * 
     * TODO Extract out a js evaluation env.
     * 
     * @param str
     * @return
     */
    @SuppressWarnings("unchecked")
    public static final RuleSet parse(String str) {
        HtmlUnitDriver driver = new HtmlUnitDriver(true);
        String name = "";
        String desc = "";
        List<Rule> rules = Lists.newArrayList();
        HashMap<String, Object> res = null;
        try {
            driver.get("http://localhost:8000/test.html");
            res =
                    (HashMap<String, Object>) driver.executeScript("var x = "
                            + str + "; return x;");
            name = (String) res.get("name");
            desc = (String) res.get("description");
            List<HashMap<String, Object>> rawRules =
                    (List<HashMap<String, Object>>) res.get("rules");

            rules = Lists.transform(rawRules, Rule.PARSE);
        } finally {
            driver.quit();
        }
        return new RuleSet(name, desc, ImmutableList.copyOf(rules));
    }

    private final String _name;
    private final String _description;
    private final ImmutableList<Rule> _rules;

    public RuleSet(String name, String description,
            ImmutableList<Rule> immutableList) {
        _name = name;
        _description = description;
        _rules = immutableList;
    }

    public String getName() {
        return _name;
    }

    public String getDescription() {
        return _description;
    }

    public ImmutableList<Rule> getRules() {
        return _rules;
    }

    @Override
    public String toString() {
        StringBuilder rules = new StringBuilder();
        for (Rule r : getRules()) {
            if (0 != rules.length()) {
                rules.append(",\n");
            }
            rules.append(r.toString());
        }
        Gson gson = new Gson();
        return "{ 'name': " + gson.toJson(getName()) + ", " +
                " 'description': " + gson.toJson(getDescription()) + ", " + 
                " 'rules': [" + rules.toString() + "]" +
                "}";
    }
    
    
}
