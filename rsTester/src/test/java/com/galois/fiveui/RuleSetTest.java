/**
 * Module     : RuleSetTest.java
 * Copyright  : (c) 2011-2012, Galois, Inc.
 *
 * Maintainer :
 * Stability  : Provisional
 * Portability: Portable
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.galois.fiveui;

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.List;
import org.junit.Test;

import com.google.common.collect.ImmutableList;

/**
 * Test parsing of RuleSet and Rule objects using the built-in parse methods
 * of both classes.
 * <p>
 * Currently there are tests for parsing rule sets containing 0, 1, and 2
 * rules.
 *
 */
public class RuleSetTest {
	
   /**
    * Test parsing a rule set containing no rules.
    * 
    * @throws AssertionError
    */
   @Test
   public void testParseNoRule() {
      testParse("the name", "a descr", "[]", new ArrayList<Rule>());
   }
   
   /**
    * Test parsing a rule set containing one rule.
    * 
    * @throws AssertionError
    */
   @Test
   public void testParseOneRule() {
	  String str = "[{'name':'a', 'description':'b', 'id':1, 'rule':function () {}}]";
      List<Rule> rules = ImmutableList.of(new Rule("a", "b", "function () {}", 1));
      testParse("the name", "a descr", str, rules);
   }
   
   /**
    * Test parsing a rule set containing two distinct rules.
    * 
    * @throws AssertionError
    */
   @Test
   public void testParseTwoRule() {
	  String str = "[{'name':'a', 'description':'b', 'id':1, 'rule':function () {}},"
			     + " {'name':'c', 'description':'d', 'id':2, 'rule':function () {}}]";
      List<Rule> rules = ImmutableList.of(new Rule("a", "b", "function () {}", 1),
    		                              new Rule("c", "d", "function () {}", 2));
      testParse("the name", "a descr", str, rules);
   }
   
   /**
    * Helper function for parsing unit tests.
    * <p>
    * testParse takes a String name, description, and list of rules and constructs
    * a RuleSet object using RuleSet.parse. This object is compared to the given
    * oracle.
    * 
    * @param name name of the rule set
    * @param desc description of the ruleset
    * @param rules a string representing a list of rules
    * @param rulesOracle list of Rule objects
    */
   private void testParse(String name, String desc, String rules, List<Rule> rulesOracle) {
      RuleSet rs = RuleSet.parse("{ 'name': '" +name+"'" +
                    ", 'description': '"+desc+"'" +
                    ", 'rules': " + rules +
                    "};");
      ImmutableList<Rule> rsRules = rs.getRules();
      
      assertEquals("name cmp", name, rs.getName());
      assertEquals("desc cmp", desc, rs.getDescription());
      assertEquals("number of rules", rulesOracle.size(), rsRules.size());
      for (int i=0; i<rulesOracle.size(); i++) {
    	  assertEquals(String.format("rule %d", i), 
    			       rulesOracle.get(i),
    			       rsRules.get(i));
      }
   }
}
