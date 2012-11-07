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

import org.junit.Assert;
import org.junit.Ignore;
import org.junit.Test;

import com.google.common.collect.ImmutableList;

public class RuleSetTest {
   @Test
   public void testParseNoFns() {
      testParse("the name", "a descr", "[]", new ArrayList<Rule>());
   }
   
   @Test
   public void testParseOneFn() {
	  String str = "[{'name':'a', 'description':'b', 'id':1, 'rule':function () {}}]";
      List<Rule> rules = ImmutableList.of(new Rule("a", "b", "function () {}", 1));
      testParse("the name", "a descr", str, rules);
   }
   
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
