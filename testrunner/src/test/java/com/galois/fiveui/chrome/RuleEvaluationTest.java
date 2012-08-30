/**
 * Module     : RuleEvaluationTest.java
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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.List;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

import com.galois.fiveui.testrunner.Drivers;
import com.galois.fiveui.testrunner.FileServer;
import com.galois.fiveui.testrunner.FiveUINav;
import com.google.common.base.Predicate;
import com.google.common.io.Files;


public class RuleEvaluationTest {
	private static ChromeDriver _driver;
	private static FiveUINav _fiveui;
	private static FileServer _server;
	
	@BeforeClass
	public static void setUp() {
		_driver = Drivers.buildChromeDriver();
		_fiveui = new FiveUINav(_driver);
		
		try {
			// set up a file server to serve from the exampleData dir:
			_server = new FileServer("../");
			_server.start();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@AfterClass
	public static void tearDown() {
		_driver.quit();
		try {
			_server.stop();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Before
	public void preTest() throws InterruptedException {
		_fiveui.clearOptions();
	}
	
	/**
	 * Check to see that a very basic rule will evaluate in the context of a matching url.
	 * @throws InterruptedException 
	 */
	@Test
	public void ruleEvaluates() throws InterruptedException {
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
		_fiveui.setDisplayDefault(true);
		
		_driver.get("http://localhost:"+_server.getPort()+"/exampleData/basic/headings.html");
				
		_fiveui.expectCondition("FiveUI Window should be showing", 5, new Predicate<WebDriver>() {
			public boolean apply(WebDriver input) {
				List<WebElement> uicWindow = _driver.findElements(By.id("uic-top"));
				return uicWindow.size() != 0 && uicWindow.get(0).isDisplayed();
			}
		});
		
		_fiveui.expectCondition("Wrong number of problems.", 5, new Predicate<WebDriver>() {
			public boolean apply(WebDriver input) {
				List<WebElement> problems = _driver.findElements(By.cssSelector("#problemList>.pr"));
				return problems.size() != 1;
			}
		});
	}
	
	/**
	 * Check that selecting a rule highlights the correct element of the dom.
	 * @throws InterruptedException 
	 * @throws IOException 
	 */
	@Test
	public void rulesHighlight() throws InterruptedException, IOException {
		String rsName = "reportOnSampleText";
		File rsFile = new File("../exampleData/ruleSets/"+rsName+".json");
		String ruleSet = Files.toString(rsFile, Charset.defaultCharset());
		
		_fiveui.addRuleSet(ruleSet);
		
		String pattern = "*localhost*";
		_fiveui.addUrlPat(pattern, rsName);
		_fiveui.setDisplayDefault(true);
		
		_driver.get("http://localhost:"+_server.getPort()+"/exampleData/basic/headings.html");
		
		
		_fiveui.expectCondition("Wrong number of problems.", 5, new Predicate<WebDriver>() {
			public boolean apply(WebDriver input) {
			    //List<WebElement> problems = _driver.findElements(By.cssSelector("#problemList .prExpand"));
			    List<WebElement> problems = _driver.findElements(By.className("prExpand"));
				return problems.size() == 1;
			}
		});
		
		WebElement expand = _driver.findElement(By.cssSelector("#problemList .prExpand"));
		expand.click();
		
		_fiveui.expectCondition("Nothing was tagged as a uic-problem.", 5, new Predicate<WebDriver>() {
			public boolean apply(WebDriver input) {
				List<WebElement> problems = _driver.findElements(By.className("uic-problem"));
				return problems.size() == 1;
			}
		});
	}
}