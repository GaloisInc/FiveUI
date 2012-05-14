/**
 * Module : Rule.java Copyright : (c) 2011-2012, Galois, Inc.
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

import com.google.common.base.Function;
import com.google.gson.Gson;

public class Rule {

    /**
     * Function wrapper around `RuleSet.parse` for use in `transform` and other
     * functional combinators.
     */
    public static final Function<HashMap<String, Object>, Rule> PARSE =
            new Function<HashMap<String, Object>, Rule>() {
                public Rule apply(final HashMap<String, Object> input) {
                    return Rule.parse(input);
                }
            };

    /**
     * Parse a string representation of a Rule into a Java POJO.
     * 
     * @param str
     * @return
     */
    public static final Rule parse(final HashMap<String, Object> res) {
        String name = (String) res.get("name");
        String desc = (String) res.get("description");
        String rule = res.get("rule").toString();
        return new Rule(name, desc, rule);
    }

    private final String _name;
    private final String _desc;
    private final String _rule;
    
    public Rule(final String name, final String desc, final String rule) {
        this._name = name;
        this._desc = desc;
        this._rule = rule;
    }

    public String getName() {
        return _name;
    }

    public String getDescription() {
        return _desc;
    }

    public String getRule() {
        return _rule;
    }

    @Override
    public String toString() {
        Gson gson = new Gson();
        
        return "{ 'name': " + gson.toJson(getName()) + ",\n" +
                " 'description': " + gson.toJson(getDescription()) + ",\n" +
                " 'ruleStr': " + gson.toJson(getRule()) + "\n" +
                "}";
    }
}
