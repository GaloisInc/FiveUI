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

import java.io.File;
import java.io.IOException;
import java.util.List;

import com.google.common.collect.ImmutableCollection;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

public class RuleSet {

	public static RuleSet parse(String rsFileName) throws JsonSyntaxException, IOException {
		String descDir = new File(rsFileName).getParent();
		
        Gson gson = new Gson();
        RuleSet rs = gson.fromJson(Utils.readFile(rsFileName), RuleSet.class);
        
        rs.setDirectory(descDir);
        return rs;
	}

    public void setDirectory(String descDir) {
    	this.descDir = descDir;
	}

	private final String name;
    private final String description;
    private final List<String> rules;
    
    private transient ImmutableMap<String, Rule> _evaledRules = null;

	private transient String descDir = ".";
	
    public RuleSet(String name, String description, List<String> ruleFiles) {
        this.name = name;
        this.description = description;
        this.rules = ruleFiles;
    }
    
    private void parseRules() {
        ImmutableMap.Builder<String, Rule> builder = ImmutableMap.builder();
        
        // Parse all the rules from files:
        for (String r : rules) {
        	String adjustedPath = descDir + File.separator + r;
        	try {
				Rule evRule = Rule.parse(
						Utils.readFile(adjustedPath));
			    
				builder.put(evRule.getName(), evRule);
			} catch (IOException e) {
				System.err.println("Could not load rule from file: "+adjustedPath);
				System.err.println("  error: "+e);
			}
        }
        
        _evaledRules = builder.build();
    }
	
    /**
     * Construct a new empty rule set.
     * 
     * @return a new empty RuleSet object
     */
    public static RuleSet empty() {
    	List<String> rules = Lists.newArrayList();
    	return new RuleSet("", "", ImmutableList.copyOf(rules));
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public ImmutableCollection<Rule> getRules() {
    	if (null == _evaledRules) {
    		parseRules();
    	}
    	
        return _evaledRules.values();
    }

	public Rule getRule(String ruleName) {
		return _evaledRules.get(ruleName);
	}
    
    @Override
    public String toString() {
    	Gson gson = new Gson();
    	return gson.toJson(this);
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result
                  + ((description == null) ? 0 : description.hashCode());
        result = prime * result + ((name == null) ? 0 : name.hashCode());
        result = prime * result + ((rules == null) ? 0 : rules.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        RuleSet other = (RuleSet) obj;
        if (description == null) {
            if (other.description != null)
                return false;
        } else if (!description.equals(other.description))
            return false;
        if (name == null) {
            if (other.name != null)
                return false;
        } else if (!name.equals(other.name))
            return false;
        if (rules == null) {
            if (other.rules != null)
                return false;
        } else if (!rules.equals(other.rules))
            return false;
        return true;
    }

}
