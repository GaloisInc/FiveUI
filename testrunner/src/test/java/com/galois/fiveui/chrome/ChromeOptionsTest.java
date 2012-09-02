/**
 * Module     : ChromeOptionsTest.java
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
package com.galois.fiveui.chrome;

import java.util.List;


import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.galois.fiveui.drivers.Drivers;
import com.galois.fiveui.testrunner.FiveUINav;
import com.google.common.base.Predicate;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;

public class ChromeOptionsTest {
	private static ChromeDriver _driver;
	private static FiveUINav _fiveui;

	
	@BeforeClass
	public static void setUp() {
		_driver = Drivers.buildChromeDriver();
		_fiveui = new FiveUINav(_driver);
	}
	
	@AfterClass
	public static void tearDown() {
		_driver.quit();
	}

	@Before
	public void preTest() throws InterruptedException {
		_fiveui.clearOptions();
	}
	
	/**
	 * Check to see if the options page loads more or less correctly. 
	 * 
	 * @throws InterruptedException
	 */
	@Test
	public void testOptionsPageLoads() throws InterruptedException {
		
		WebElement optionsTitle = _driver.findElement(By.id("navbar-content-title"));
		Assert.assertEquals("Wrong options page?", "Settings", optionsTitle.getText());
		
		final ImmutableMap<String, String> navAndTitles =
			ImmutableMap.of("nav > #url-defaults", "#tab-url-defaults > .title",
                            "nav > #rule-sets",    "#tab-rule-sets > .title",
                            "nav > #basics",       "#tab-basics > .title");
		
		for (final String key : navAndTitles.keySet()){
			WebElement link = _driver.findElementByCssSelector(key);
			link.click();
			_fiveui.expectCondition("Expected title never became visible",
					5, new Predicate<WebDriver>(){
						public boolean apply(WebDriver input) {
							WebElement elt = _driver.findElementByCssSelector(navAndTitles.get(key));
							return (! elt.getText().equals("")) && elt.isDisplayed();
						}
			        });
		}
//		
//		final WebElement urlTitle = _driver.findElementByCssSelector("#tab-url-defaults>.title");
//		final WebElement rsTitle = _driver.findElementByCssSelector("#tab-rule-sets>.title");
//		
//		Assert.assertTrue("url defaults title is *not* showing", urlTitle.isDisplayed());
//		Assert.assertTrue("rule sets title is showing", rsTitle.getText().equals("")
//				                                     || rsTitle.isDisplayed());
//
//	    WebElement nav = _driver.findElement(By.id("rule-sets"));
//		nav.click();
//		(new WebDriverWait(_driver, 10)).until(new Predicate<WebDriver>() {
//			public boolean apply(WebDriver input) {
//				return !urlTitle.isDisplayed();
//			}
//		});
//		Assert.assertTrue("rule sets title is *not* showing", rsTitle.isDisplayed());
//		Assert.assertTrue("url defaults title is showing", urlTitle.getText().equals("") 
//					                                    || urlTitle.isDisplayed());
	}

	/**
	 * Check to see that a rule set can be added, and that it shows 
	 * up in the list of Rule Sets.
	 * 
	 * @throws InterruptedException
	 */
	@Test
	public void simpleRuleSetTest() throws InterruptedException {
		String rsName = "Test rule set";
		String ruleSet = "{ 'name': '"+rsName+"', " +
				         "  'description': 'test'," +
				         "  'rules': [ { 'name': 'Test rule'," +
				         "               'description': 'An empty test rule'," +
				         "               'rule': function() { report('test error'); }" +
				         "             } ]" +
				         "}";
			
		_fiveui.addRuleSet(ruleSet);
		List<WebElement> ruleSets = _driver.findElements(By.cssSelector("#ruleSetEntries .title"));
		
		Assert.assertEquals("Rule Set was not added", 1, ruleSets.size());
		Assert.assertEquals("Wrong ruleset found", rsName, ruleSets.get(0).getText());
	}

	/**
	 * Check to see that a rule set can be added, and that it shows 
	 * up in the list of Rule Sets.
	 * 
	 * @throws InterruptedException
	 */
	@Test
	public void simpleUlPatTest() throws InterruptedException {
		String rsName = "Test rule set";
		String ruleSet = "{ 'name': '"+rsName+"', " +
				         "  'description': 'test'," +
				         "  'rules': [ { 'name': 'Test rule'," +
				         "               'description': 'An empty test rule'," +
				         "               'rule': function() { report('test error'); }" +
				         "             } ]" +
				         "}";
			
		_fiveui.addRuleSet(ruleSet);
		
		String pattern = "*localhost*";
		_fiveui.addUrlPat(pattern, rsName);
		
		_fiveui.loadUrlPatsPage();
		
		List<WebElement> urlPats = _driver.findElements(By.cssSelector("#urlPatEntries .title"));
		Assert.assertEquals("Rule Set was not added", 1, urlPats.size());
		Assert.assertEquals("Wrong ruleset found", pattern, urlPats.get(0).getText());
	}
	
	
	
	@Test
	public void runRuleSetTest() throws InterruptedException {
		String rsName = "Test rule set";
		String ruleSet = "{ 'name': '"+rsName+"', " +
				         "  'description': 'test'," +
				         "  'rules': [ { 'name': 'Test rule'," +
				         "               'description': 'An empty test rule'," +
				         "               'rule': function() { report('test error'); }" +
				         "             } ]" +
				         "}";
			
		_fiveui.addRuleSet(ruleSet);
		
		
	}
	
	
}
