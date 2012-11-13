/**
 * RunDescriptionTest.java
 * 
 * Copyright (c) 2012 Galois, Inc.
 */
package com.galois.fiveui;

import java.io.FileNotFoundException;
import java.util.ArrayList;

import junit.framework.Assert;

import org.junit.Test;

import com.google.common.collect.ImmutableList;

/**
 * @author creswick
 *
 */
public class RunDescriptionTest {

    private static final String RUN_DESCRIPTION_DIR = "src/test/resources/runDescriptions/";

    /**
     * Test method for {@link com.galois.fiveui.RSTestDescription}.
     * @throws FileNotFoundException 
     */
    @Test
    public final void testDeserialize_sample0() throws FileNotFoundException {
        
        String jsonFileName = RUN_DESCRIPTION_DIR + "sample0.json";
        String ruleSetLoc = 
                RUN_DESCRIPTION_DIR + "../ruleSets/emptyRuleSet.json";
        
        ImmutableList<Rule> emptyRuleList = ImmutableList.of();
        RuleSet rsOracle = 
                new RuleSet("emptyRuleSet", "", emptyRuleList);
        
        RSTestDescription oracle = 
                new RSTestDescription(ruleSetLoc, 
                        new ArrayList<RSTestDescription.URIMap>(), rsOracle); 
        
        
        RSTestDescription actual = RSTestDescription.parse(jsonFileName);
        assertObjEqual("Object deserialized incorrectly.", oracle, actual);
    }

    /**
     * Test method for {@link com.galois.fiveui.RSTestDescription}.
     * @throws FileNotFoundException 
     */
    @Test
    public final void testDeserialize_sample1() throws FileNotFoundException {
        
        String jsonFileName = RUN_DESCRIPTION_DIR + "sample1.json";
        String ruleSetLoc = 
                RUN_DESCRIPTION_DIR + "../ruleSets/simpleRuleSet1.json";
        
        RuleSet rsOracle =
                new RuleSet("simpleRuleSet1", "", ImmutableList.of(
                        new Rule("trivial check", "test desc", "", 42)));
        
        RSTestDescription oracle = 
                new RSTestDescription(ruleSetLoc, 
                        new ArrayList<RSTestDescription.URIMap>(), rsOracle); 
        
        
        RSTestDescription actual = RSTestDescription.parse(jsonFileName);
        assertObjEqual("Object deserialized incorrectly.", oracle, actual);
    }

    private void assertObjEqual(String msg, Object oracle, Object actual) {
        Assert.assertTrue(msg + "; expected: "+oracle+" actual: "+actual,
                oracle.equals(actual));
    }
    
    
}
