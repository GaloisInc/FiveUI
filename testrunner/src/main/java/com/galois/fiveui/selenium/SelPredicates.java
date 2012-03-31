/**
 * Module     : SelPredicates.java
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
package com.galois.fiveui.selenium;

import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebElement;

import com.google.common.base.Predicate;

public class SelPredicates {
	
	/**
	 * Test to see if a WebElement is visible.  
	 * Catches {@link StaleElementReferenceException}s,
	 * returning false if the element is not connected to the DOM.
	 */
	public static final Predicate<? super WebElement> isVisible = 
		new Predicate<WebElement>() {
			public boolean apply(WebElement input) {
				try {
					return input.isDisplayed();
				} catch (StaleElementReferenceException e) {
					return false;
				}
			}
		};
}
