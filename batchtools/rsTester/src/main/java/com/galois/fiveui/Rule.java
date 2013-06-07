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

import org.openqa.selenium.htmlunit.HtmlUnitDriver;

import com.google.gson.Gson;

public class Rule {

	/**
	 * Parse a string representation of a Rule into a Java POJO.
     *
	 * @param str string representing a rule set
	 * @return a RuleSet object
	 */
	@SuppressWarnings("unchecked")
	public static final Rule parse(String str) {
		HtmlUnitDriver driver = new HtmlUnitDriver(true);
		String name = "";
		String desc = "";
		String ruleStr = "";
		HashMap<String, Object> res = null;
		String stmt = "exports = {};\n"+str + "; return exports;";
		try {
			driver.get("http://localhost:8000/test.html");
			res = (HashMap<String, Object>) driver.executeScript(stmt);
			name = (String) res.get("name");
			desc = (String) res.get("description");
			ruleStr = res.get("rule").toString();
		} finally {
			driver.quit();
		}

		return new Rule(name, desc, ruleStr);
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
        
        return "exports.name = " + gson.toJson(getName()) + ";\n" +
               "exports.description = " + gson.toJson(getDescription()) + ";\n" +
               "exports.rule = " + gson.toJson(getRule()) + ";\n";
    }
    
    /**
     * Equals and hashCode ignore the rule function text when performing comparisons.
     */
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((_desc == null) ? 0 : _desc.hashCode());
        result = prime * result + ((_name == null) ? 0 : _name.hashCode());
        return result;
    }

    /**
     * Equals and hashCode ignore the rule function text when performing comparisons.
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        Rule other = (Rule) obj;
        if (_desc == null) {
            if (other._desc != null)
                return false;
        } else if (!_desc.equals(other._desc))
            return false;
        if (_name == null) {
            if (other._name != null)
                return false;
        } else if (!_name.equals(other._name))
            return false;
        return true;
    }
}
