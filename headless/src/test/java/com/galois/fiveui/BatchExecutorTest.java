/**
 * Module     : BatchExecutorTest.java
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

import java.io.IOException;

import org.junit.Test;
import org.openqa.selenium.WebDriver;

import com.galois.fiveui.BatchRunner;
import com.galois.fiveui.HeadlessRunDescription;
import com.galois.fiveui.Result;
import com.galois.fiveui.drivers.Drivers;
import com.google.common.collect.ImmutableList;

import junit.framework.Assert;


/**
 * @author bjones
 *
 */
public class BatchExecutorTest {

	private static final String RUN_DESCRIPTION_DIR = "src/test/resources/runDescriptions/";
	
	@Test
	public void simpleTest() {
		Assert.assertEquals("Booleans are not equal.", true, true);
	}
	
	/**
	 * This unit test requires that a webserver be running locally on port 8000,
	 * what it serves does not matter.
	 * 
	 * @throws IOException 
	 * @throws FileNotFoundException
	 */
	@Test
	public void headlessRunTest0() throws IOException {
		String jsonFileName = RUN_DESCRIPTION_DIR + "headlessRunTest0.json";
		testHeadlessRun(jsonFileName);
	}
	
	/**
	 * This unit test requires internet access to http://www.cnn.com
	 * 
	 * @throws IOException 
	 * @throws FileNotFoundException
	 */
	@Test
	public void headlessRunTestCNN() throws IOException {
		String jsonFileName = RUN_DESCRIPTION_DIR + "headlessRunTestCNN.json";
		testHeadlessRun(jsonFileName);
	}
	
	/**
	 * This unit test requires internet access to http://www.cnn.com
	 * 
	 * @throws IOException 
	 * @throws FileNotFoundException
	 */
	@Test
	public void headlessRunTestMil() throws IOException {
		String jsonFileName = RUN_DESCRIPTION_DIR + "headlessRunTestMil.json";
		testHeadlessRun(jsonFileName);
	}
	
	/**
	 * Helper method for headless run unit tests.
	 *  
	 * @param fn filename of a .json file containing a headless run description
	 */
	private static void testHeadlessRun(String fn) {
		WebDriver driver = Drivers.buildFFDriver();                    // initialize the webdriver
		boolean flag = true;
		try {
			HeadlessRunDescription descr = HeadlessRunDescription.parse(fn);
			BatchRunner runner = new BatchRunner(driver);              // setup the batch runner
			ImmutableList<Result> results = runner.runHeadless(descr); // excecute the run
			System.out.println(results.toString());                    // print out results
		} catch (Exception e) {
			System.err.println("testHeadlessRun: exception caught while running a headless run description");
			flag = false;
		} finally {
			driver.quit();
		}
		assert(flag);
	}

}
