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

import java.io.File;
import java.io.IOException;
import java.net.BindException;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import com.galois.fiveui.BatchRunner;
import com.galois.fiveui.HeadlessRunDescription;
import com.galois.fiveui.Result;
import com.google.common.collect.ImmutableList;

import junit.framework.Assert;


/**
 * @author bjones
 *
 */
public class BatchExecutorTest {

	private static final String RUN_DESCRIPTION_DIR = "src/test/resources/runDescriptions/";
	private static Logger logger = Logger.getLogger("com.galois.fiveui.BatchExecutorTest");
	private static NanoHTTPD httpServer;
	
	@BeforeClass
	public static void setupTests() {
		BasicConfigurator.configure();
        logger.setLevel(Level.DEBUG);
        Logger root = Logger.getRootLogger();
        root.setLevel(Level.ERROR);
	    // start up local web server for crawl tests
		File dir = new File(".");
		logger.info("Starting NanoHTTPD webserver in " + dir.getAbsolutePath() + " on port 8000 ...");
		try {
			httpServer = new NanoHTTPD(8000, dir);
		} catch (BindException e) {
			logger.debug("assuming that local web server is already running");
		} catch (IOException e1) {
			e1.printStackTrace();
			Assert.assertTrue("failed to start NanoHTTPD in current directory " + dir.getAbsolutePath(), false);
		}
	}
	
	@AfterClass
	public static void teardown() {
		LogManager.shutdown();
		httpServer.stop();
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
	 * This unit test requires Internet access to http://www.cnn.com
	 * 
	 * @throws IOException 
	 * @throws FileNotFoundException
	 */
	@Ignore
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
	@Ignore
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
		boolean flag = true;
		try {
			HeadlessRunDescription descr = HeadlessRunDescription.parse(fn);
			BatchRunner runner = new BatchRunner();
			ImmutableList<Result> results = runner.runHeadless(descr);
			logger.info(results.toString());
		} catch (Exception e) {
			logger.error("testHeadlessRun: exception caught while running a headless run description");
			logger.error(e.toString());
			flag = false;
		} 
		Assert.assertTrue(flag);
	}

}
