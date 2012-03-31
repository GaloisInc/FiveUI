/**
 * Module     : StateTest.java
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
package com.galois.fiveui.jstests;


import org.junit.runner.RunWith;

import com.galois.fiveui.testrunner.JSRunner;
import com.galois.fiveui.testrunner.ResultsUrl;

/**
 * @author creswick
 *
 */
@RunWith(JSRunner.class)
public class StateTest {
	private static final String testPath = "data/fiveui/state-test.html";
	private static final String testUrl = "http://localhost:8080/"+testPath;
	
	@ResultsUrl
	public static String url() {
		return testUrl;
	}
}