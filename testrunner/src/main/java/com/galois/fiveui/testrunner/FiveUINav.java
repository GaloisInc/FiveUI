/**
 * Module     : FileUINav.java
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
package com.galois.fiveui.testrunner;

import java.util.List;
import java.util.Set;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.galois.fiveui.selenium.SelPredicates;
import com.galois.fiveui.selenium.SelUtils;
import com.google.common.base.Predicate;
import com.google.common.collect.Collections2;

public class FiveUINav {

	private final WebDriver _driver;

	public FiveUINav(WebDriver driver) {
		super();
		this._driver = driver;
	}

	public void loadOptionsPage() throws InterruptedException {
		final Set<String> origHandles = _driver.getWindowHandles();

		_driver.get("chrome://settings/extensions");
		
		WebElement optionsLink = _driver.findElement(By.className("extension-links-trailing"));
		optionsLink.click();
		
		(new WebDriverWait(_driver, 10)).until(new Predicate<WebDriver>() {
			public boolean apply(WebDriver input) {
				return _driver.getWindowHandles().size() == origHandles.size() + 1;
			}
		});		
		_driver.close();
		Set<String> newHandles = _driver.getWindowHandles();
		newHandles.removeAll(origHandles);
		String optionsHandle = newHandles.iterator().next();
		_driver.switchTo().window(optionsHandle);
	}
	
	/**
	 * Assumes options page is active.
	 */
	public void clickAndRemove(final String cssSelector) {
		List<WebElement> removeBtns = _driver.findElements(By.cssSelector(cssSelector));
		for (WebElement button : Collections2.filter(removeBtns, SelPredicates.isVisible)) {
			button.click();
		}
		
		(new WebDriverWait(_driver, 10)).until(new Predicate<WebDriver>() {
			public boolean apply(WebDriver input) {
				List<WebElement> elts = input.findElements(By.cssSelector(cssSelector));
				return Collections2.filter(elts, SelPredicates.isVisible).size() == 0;
			}
		});
	}
	
	/**
	 * Safe to run from any active tab.
	 * 
	 * Results in the options page being active.
	 * 
	 * @throws InterruptedException
	 */
	public void clearOptions() throws InterruptedException {
		loadOptionsPage();
		removeUrlPats();
		removeRuleStes();
	}
	
	/**
	 * Assumes options page is active.
	 * @throws InterruptedException
	 */
	public void removeRuleStes() throws InterruptedException {
		loadRuleSetPage();
		clickAndRemove("div.controls>button");
	}

	/**
	 * Assumes options page is active.
	 * @throws InterruptedException
	 */
	public void removeUrlPats() throws InterruptedException {
		loadUrlPatsPage();		
		clickAndRemove("div.controls>button");
	}
	
	/**
	 * Assumes options page is active.
	 * @throws InterruptedException
	 */
	public void addRuleSet(String ruleSet) throws InterruptedException {
		loadRuleSetPage();

		WebElement addButton = _driver.findElement(By.id("addRsButton"));
		addButton.click();
		
		WebElement editor = _driver.findElement(By.cssSelector("#aceEditor textarea"));
		SelUtils.paste(editor, ruleSet);
		
		// hack.  The last keys sent don't *always* finish before we click save, which causes 
		// an eval error, popping up an alert that shouldn't happen.
		// This small delay should help keep that from happening. Normally, we'd use a 
		// WebDriverWait, or FiveUINave.expectCondition, but this is a somewhat unique situation
		// because of the nuances of the Ace Editor.
		Thread.sleep(100); 
		
		WebElement saveButton = _driver.findElement(By.id("saveEditButton"));
		saveButton.click();
	}
	
	/**
	 * Assumes options page is active.
	 * @throws InterruptedException
	 */
	public void addUrlPat(String pattern, String rsName) throws InterruptedException {
		loadUrlPatsPage();
		
		WebElement addButton = _driver.findElement(By.id("addUrlPat"));
		addButton.click();
		
		WebElement editor = _driver.findElement(By.id("urlPatRegex"));
		editor.sendKeys(pattern);
		
		WebElement ruleSets = _driver.findElement(By.cssSelector("#urlPatRuleSetId"));
		Select select = new Select(ruleSets);
		select.selectByVisibleText(rsName);
		
		WebElement saveButton = _driver.findElement(By.id("confirmAddUrlPat"));
		saveButton.click();
	}

	/**
	 * Assumes options page is active.
	 * 
	 * @param show True to ensure the default display is enabled, 
	 *             False to make the fiveui window hide by default.
	 */
	public void setDisplayDefault(boolean show) {
		loadOptionsPane("basics");
		WebElement elt = _driver.findElement(By.id("windowDisplayDefault"));
		
		if ( elt.isSelected() != show ){
			elt.click();
		}
	}
	
	/**
	 * Assumes options page is active.
	 * @throws InterruptedException
	 */
	public void loadUrlPatsPage() throws InterruptedException {
		loadOptionsPane("url-defaults");
	}
	
	/**
	 * Assumes options page is active.
	 * @throws InterruptedException
	 */
	public void loadRuleSetPage() throws InterruptedException {
		loadOptionsPane("rule-sets");
	}
	
	private void loadOptionsPane(String navId) {
		
		final WebElement navLink = _driver.findElement(By.id(navId));
		navLink.click();
		(new WebDriverWait(_driver, 10)).until(new Predicate<WebDriver>() {
			public boolean apply(WebDriver input) {
				String classes = navLink.getAttribute("class");
				return classes.contains("selected");
			}
		});
	}


	/**
	 * Wait for a specified condition to become true.  Throws an {@link AssertionError}
	 * if the timeout occurs before the condition is satisfied.
	 * 
	 * @param msg
	 * @param condition
	 */
	public void expectCondition(final String msg, Predicate<WebDriver> condition) {
		(new WebDriverWait(_driver, 5) {

			@Override
			protected RuntimeException timeoutException(String message,
					RuntimeException lastException) {
				throw new AssertionError(msg);
			}
			
		}).until(condition);
	}
}
