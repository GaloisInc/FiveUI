/**
 * Module     : FirefoxExtensionRunsTest.java
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
package com.galois.fiveui.firefox;

import junit.framework.Assert;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.galois.fiveui.drivers.Drivers;

public class FirefoxExtensionRunsTest {
	static FirefoxDriver _driver;

	@BeforeClass
	public static void setUp() {
		_driver = Drivers.buildFFDriver();
	}
	
	@Test
	@Ignore
	public void testRuns() throws InterruptedException {
		loadOptionsPage();
		
		WebElement optionsTitle = _driver.findElement(By.id("navbar-content-title"));
		Assert.assertEquals("Wrong options page?", "Settings", optionsTitle.getText());
	}

	private void loadOptionsPage() {
		
	}
	
	@AfterClass
	public static void tearDown() {
		_driver.quit();
	}
}
