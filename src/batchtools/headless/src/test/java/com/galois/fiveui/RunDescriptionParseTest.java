/**
 * 
 */
package com.galois.fiveui;

import java.io.IOException;

import org.junit.Assert;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.junit.BeforeClass;
import org.junit.Test;

import com.google.common.collect.ImmutableList;

/**
 * @author bjones
 *
 */
public class RunDescriptionParseTest {
	private static final String RUN_DESCRIPTION_DIR = "src/test/resources/runDescriptions/";
	private static Logger logger = Logger.getLogger("com.galois.fiveui.HeadlessTest");
	
	@BeforeClass
	public static void beforeClass() {
		BasicConfigurator.configure();
		Logger root = Logger.getRootLogger();
		root.setLevel(Level.ERROR);
		logger.setLevel(Level.DEBUG);
		logger.debug("running headless tests...");
	}
    /**
     * Test method for {@link com.galois.com.galois.fiveui.HeadlessRunDescription}, parses
     * 'src/test/resources/runDescriptions/headlessSample0.json'.
     * 
     * @throws IOException 
     */
    @Test
    public final void testDeserialize_headlessSample0() throws IOException {
        
        String jsonFileName = RUN_DESCRIPTION_DIR + "headlessSample0.json";
        String ruleSetLoc = 
                RUN_DESCRIPTION_DIR + "../ruleSets/emptyRuleSet.json";
        RuleSet ruleSetOracle = RuleSet.parseFile(ruleSetLoc);
        HeadlessAtom headlessAtomOracle = 
                new HeadlessAtom("http://testhost", ruleSetOracle);  
        HeadlessRunDescription oracle = 
                new HeadlessRunDescription(ImmutableList.of(headlessAtomOracle));     
        
        HeadlessRunDescription actual = HeadlessRunDescription.parse(jsonFileName);
        assertObjEqual("Object deserialized incorrectly.", oracle, actual);
    }

    /**
     * Test method for {@link com.galois.com.galois.fiveui.HeadlessRunDescription}, parses
     * 'src/test/resources/runDescriptions/headlessSample1.json'.
     * 
     * @throws IOException 
     */
    @Test
    public final void testDeserialize_headlessSample1() throws IOException {
        
        String jsonFileName = RUN_DESCRIPTION_DIR + "headlessSample1.json";
        String ruleSetLoc = RUN_DESCRIPTION_DIR + 
        		"../../../../../rsTester/src/test/resources/ruleSets/headingGuidelines.json";
        RuleSet ruleSetOracle = RuleSet.parseFile(ruleSetLoc);
        HeadlessAtom headlessAtomOracle = 
                new HeadlessAtom("http://localhost:8000/headings.html", ruleSetOracle);  
        HeadlessRunDescription oracle = 
                new HeadlessRunDescription(ImmutableList.of(headlessAtomOracle));     
        
        HeadlessRunDescription actual = HeadlessRunDescription.parse(jsonFileName);
        assertObjEqual("Object deserialized incorrectly.", oracle, actual);
    }
    
    /**
     * Test method for {@link com.galois.com.galois.fiveui.HeadlessRunDescription}, parses
     * 'src/test/resources/runDescriptions/headlessSample2.json'.
     * 
     * @throws IOException 
     */
    @Test
    public final void testDeserialize_headlessSample2() throws IOException {
        
        String jsonFileName = RUN_DESCRIPTION_DIR + "headlessSample2.json";
        // manually build first HeadlessAtom
        String ruleSetLoc1 = 
                RUN_DESCRIPTION_DIR + "../ruleSets/alwaysErrors.json";
        RuleSet ruleSetOracle1 = RuleSet.parseFile(ruleSetLoc1);
        HeadlessAtom headlessAtomOracle1 = 
                new HeadlessAtom("http://localhost:8000/headings.html", ruleSetOracle1);  
        // manually build second HeadlessAtom
        String ruleSetLoc2 = RUN_DESCRIPTION_DIR + 
        		"../../../../../rsTester/src/test/resources/ruleSets/headingGuidelines.json";

        RuleSet ruleSetOracle2 = RuleSet.parseFile(ruleSetLoc2);
        HeadlessAtom headlessAtomOracle2 = 
                new HeadlessAtom("http://testhost2", ruleSetOracle2);  
        
        HeadlessRunDescription oracle = 
                new HeadlessRunDescription(ImmutableList.of(headlessAtomOracle1, 
                		                                    headlessAtomOracle2));     
        
        HeadlessRunDescription actual = HeadlessRunDescription.parse(jsonFileName);
        assertObjEqual("Object deserialized incorrectly.", oracle, actual);
    }
    
    private void assertObjEqual(String msg, Object oracle, Object actual) {
        Assert.assertTrue(msg + ";\n expected: "+oracle+"\n actual: "+actual,
                oracle.equals(actual));
    }
}
