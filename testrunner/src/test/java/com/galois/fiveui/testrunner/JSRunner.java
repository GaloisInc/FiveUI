/**
 * Module     : JSRunner.java
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

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import junit.framework.AssertionFailedError;

import org.junit.runner.Description;
import org.junit.runner.Runner;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunNotifier;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import com.galois.fiveui.drivers.Drivers;
import com.google.common.collect.ImmutableMap;

/**
 * @author creswick
 *
 */
public class JSRunner extends Runner {
	
	private FileServer _server;
	private List<JSTestResult> _results = new ArrayList<JSTestResult>();
	
	@SuppressWarnings("rawtypes")
	private Class _clazz;
	
	public JSRunner(@SuppressWarnings("rawtypes") Class testClass) {
		super();
		_clazz = testClass;
		
		try {
			// set up a file server to serve from the parent directory:
			_server = new FileServer("../contexts/");
			_server.start();
			
			gatherResults(getUrl(_clazz));
			
			_server.stop();
		} catch (Exception e) {
			scream("Unhandled catch in JSRunner constructor");
			e.printStackTrace();
		}
	}

	private String getUrl(@SuppressWarnings("rawtypes") Class clazz) {
		for (Method m : clazz.getMethods() ){
	       ResultsUrl ann = m.getAnnotation(ResultsUrl.class);
	       if (null != ann) {
	    	   try {
				return (String) m.invoke(clazz);
			} catch (Exception e) {
				System.err.println("Exception accessing url via annotation");
			}
	       }
		}
		
		return null;
	}

	private void gatherResults(String testUrl) {
		ImmutableMap<String, WebDriver> drivers = ImmutableMap.of(
//				"Chrome", (WebDriver)Drivers.buildChromeDriver(),
				"FireFox", (WebDriver)Drivers.buildFFDriver());
		
		for (String key : drivers.keySet()) {
			runDriver(drivers.get(key), key, testUrl);
		}
	}

	private void runDriver(WebDriver driver, String driverName, String testUrl) {
		driver.get(testUrl);
		JavascriptExecutor exe = (JavascriptExecutor) driver;
		
		String jsCommands = "return document.report;";
		
		Object rawRes = exe.executeScript(jsCommands);
		
		@SuppressWarnings({ "unchecked", "rawtypes" })
		List<Map<String, Object>> rawResults = (List) rawRes;

		for (Map<String, Object> obj : rawResults) {
			
			PassFail passFail = PassFail.valueOf((String)obj.get("result"));
			String name = driverName + ": " + (String)obj.get("name");
			String details = "";
			
			if (obj.containsKey("err")) {
				details = obj.get("err").toString();
			}
			Description desc = Description.createTestDescription(_clazz, name);
			_results.add(new JSTestResult(desc, passFail, details));
		}
		
        driver.quit();
	}

	@Override
	public Description getDescription() {

		Description topDesc = Description.createSuiteDescription("JavaScript tests");

		for (JSTestResult res : _results) {
			topDesc.addChild(res.getDescription());
		}
		scream("retrieved description. length="+topDesc.testCount());
		
		return topDesc;
	}

	@Override
	public void run(RunNotifier notifier) {
		for (JSTestResult res : _results) {
			notifier.fireTestStarted(res.getDescription());
			switch (res.getPassFail()) {
			case PASSED:
				// scream("passed result is firing");
				notifier.fireTestFinished(res.getDescription());
				break;

			case FAILED:
				// scream("FAILED RESULT IS FIRING");
				notifier.fireTestFailure(new Failure(res.getDescription(), 
						 new AssertionFailedError(res.getDetails())));
				break;
				
			default:
				System.err.println("unexpeted PassFail value: "+res.getPassFail());
				break;
			}
		}
	}

	private void scream(String string) {
		System.out.println("=================================");
		System.out.println("");
		System.out.println("");
		System.out.println("    "+string);
		System.out.println("");
		System.out.println("");
		System.out.println("=================================");
	}
}
