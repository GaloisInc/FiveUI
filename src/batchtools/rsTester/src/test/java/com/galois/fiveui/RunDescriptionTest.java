/**
 * RunDescriptionTest.java
 * 
 * Copyright (c) 2012 Galois, Inc.
 */
package com.galois.fiveui;

import java.io.FileNotFoundException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;

import org.junit.Assert;
import org.junit.Test;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

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
        
        ImmutableList<String> emptyRuleList = ImmutableList.of();
        RuleSet rsOracle = new RuleSet("emptyRuleSet", "", 
        				emptyRuleList, ImmutableList.<String>of());
        
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
                new RuleSet("simpleRuleSet1", "", 
                		ImmutableList.of("emptyCheck.js"), ImmutableList.<String>of());
        rsOracle.setDirectory(RUN_DESCRIPTION_DIR + "../ruleSets/");
        
        RSTestDescription oracle = 
                new RSTestDescription(ruleSetLoc, 
                        new ArrayList<RSTestDescription.URIMap>(), rsOracle); 
        
        RSTestDescription actual = RSTestDescription.parse(jsonFileName);
        assertObjEqual("Object deserialized incorrectly.", oracle, actual);
    }

    /**
     * Test method for {@link com.galois.fiveui.RSTestDescription}.
     * @throws FileNotFoundException 
     * @throws URISyntaxException 
     */
    @Test
    public final void testDeserialize_headingGuidelines() throws FileNotFoundException, URISyntaxException {
        
        String jsonFileName = RUN_DESCRIPTION_DIR + "headingSample.json";
        String ruleSetLoc = 
                RUN_DESCRIPTION_DIR + "../ruleSets/headingGuidelines.json";
        
        RuleSet rsOracle = new RuleSet(
        		"Heading Guidelines",
        		"Guidelines pertaining to the formatting and content of headings.",
        		ImmutableList.of("headingGuidelines-caps.js",
        	                     "headingGuidelines-noEmptyHdrs.js"),
        	    ImmutableList.<String>of());
        rsOracle.setDirectory(RUN_DESCRIPTION_DIR + "../ruleSets/");
        rsOracle.getRules(); // force the rules to parse
        
        RSTestDescription.URIMap uriMapOracle =
        		new RSTestDescription.URIMap(
        			new URI("http://localhost:8000/exampleData/basic/headings.html"),
        			
        			Lists.newArrayList(
        				new RSTestDescription.RuleMap("Headings are capitalized", 
        						Lists.newArrayList(ResType.Error, ResType.Error)),
        				new RSTestDescription.RuleMap("Disallow Empty Headers", 
                				Lists.newArrayList(ResType.Error))));
        		
        
        RSTestDescription oracle = 
                new RSTestDescription(ruleSetLoc, Lists.newArrayList(uriMapOracle), rsOracle); 
        
        
        RSTestDescription actual = RSTestDescription.parse(jsonFileName);
        assertObjEqual("Object deserialized incorrectly.", oracle, actual);
    }
    private void assertObjEqual(String msg, Object oracle, Object actual) {
        Assert.assertTrue(msg + "; expected: "+oracle+" actual: "+actual,
                oracle.equals(actual));
    }
    
    
}
