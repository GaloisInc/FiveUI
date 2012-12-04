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
     * Function wrapper around `Rule.parse` for use in `transform` and other
     * functional combinators.
     */
    public static final Function<HashMap<String, Object>, Rule> PARSE =
            new Function<HashMap<String, Object>, Rule>() {
                public Rule apply(final HashMap<String, Object> input) {
                    return Rule.parse(input);
                }
            };

    /**
     * Parse a HashMap representation of a Rule into a plain old Java object.
     * The input object must have keys: name, description, and rule. The 'id'
     * key is optional.
     * 
     * @param obj a HashMap to convert
     * @return a Rule object
     * @throws IllegalArgumentException
     */
    public static final Rule parse(final HashMap<String, Object> obj) {
        if ((obj !=null) && 
           !(obj.containsKey("name") &&
        	 obj.containsKey("description") &&
        	 obj.containsKey("rule")))
        	throw new IllegalArgumentException("Rule.parse:"
        	        + "failed to find all required Rule fields (name, description, and rule) in rule description:\n"
        			+ ((obj == null) ? "null" : obj.toString()));
       
    	String name = (String) obj.get("name");
        String desc = (String) obj.get("description");
        String rule = obj.get("rule").toString();
        int id;
        if (obj.containsKey("id")) {
        	id = ((Long)obj.get("id")).intValue();
        } else {
        	//System.err.println("Warning: rule " + name + " has no ID #, using ID 0");
        	id = 0;
        } 
        
        return new Rule(name, desc, rule, id);
    }

    private final String _name;
    private final String _desc;
    private final String _rule;
    private final int _id;
    
    public Rule(final String name, final String desc, final String rule, final int id) {
        this._name = name;
        this._desc = desc;
        this._rule = rule;
        this._id   = id; 
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

    public int getId() {
        return _id;
    }

    @Override
    public String toString() {
        Gson gson = new Gson();
        
        return "{ 'id': " + gson.toJson(getId()) + ",\n " +
        		" 'name': " + gson.toJson(getName()) + ",\n" +
                " 'description': " + gson.toJson(getDescription()) + ",\n" +
                " 'ruleStr': " + gson.toJson(getRule()) + "\n" +
                "}";
    }
    
    /**
     * Equals and hashCode ignore the rule function text when performing comparisons.
     */
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((_desc == null) ? 0 : _desc.hashCode());
        result = prime * result + _id;
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
        if (_id != other._id)
            return false;
        if (_name == null) {
            if (other._name != null)
                return false;
        } else if (!_name.equals(other._name))
            return false;
        return true;
    }
}
