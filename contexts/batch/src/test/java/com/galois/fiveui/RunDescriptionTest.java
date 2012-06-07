/**
 * RunDescriptionTest.java
 * 
 * Copyright (c) 2012 Galois, Inc.
 */
package com.galois.fiveui;

import static org.junit.Assert.fail;

import java.io.File;
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
     * Test method for {@link com.galois.fiveui.RunDescription#RunDescription(java.lang.String, java.util.List, com.galois.fiveui.RuleSet)}.
     * @throws FileNotFoundException 
     */
    @Test
    public final void testDeserialize_sample0() throws FileNotFoundException {
        
        String jsonFileName = RUN_DESCRIPTION_DIR + "sample0.json";
        String ruleSetLoc = 
                RUN_DESCRIPTION_DIR + "../rulesets/emptyRuleSet.json";
        
        ImmutableList<Rule> emptyRuleList = ImmutableList.of();
        RuleSet rsOracle = 
                new RuleSet("emptyRuleSet", "", emptyRuleList);
        
        RunDescription oracle = 
                new RunDescription(ruleSetLoc, 
                        new ArrayList<RunDescription.URIMap>(), rsOracle); 
        
        
        RunDescription actual = RunDescription.parse(jsonFileName);
        assertObjEqual("Object deserialized incorrectly.", oracle, actual);
    }

    /**
     * Test method for {@link com.galois.fiveui.RunDescription#RunDescription(java.lang.String, java.util.List, com.galois.fiveui.RuleSet)}.
     * @throws FileNotFoundException 
     */
    @Test
    public final void testDeserialize_sample1() throws FileNotFoundException {
        
        String jsonFileName = RUN_DESCRIPTION_DIR + "sample1.json";
        String ruleSetLoc = 
                RUN_DESCRIPTION_DIR + "../rulesets/simpleRuleSet1.json";
        
        RuleSet rsOracle =
                new RuleSet("simpleRuleSet1", "", ImmutableList.of(
                        new Rule("trivial check", "test desc", "", 42)));
        
        RunDescription oracle = 
                new RunDescription(ruleSetLoc, 
                        new ArrayList<RunDescription.URIMap>(), rsOracle); 
        
        
        RunDescription actual = RunDescription.parse(jsonFileName);
        assertObjEqual("Object deserialized incorrectly.", oracle, actual);
    }

    private void assertObjEqual(String msg, Object oracle, Object actual) {
        Assert.assertTrue(msg + "; expected: "+oracle+" actual: "+actual,
                oracle.equals(actual));
    }
    
    
}
