/**
 *
 * Copyright (c) 2009-2013,
 *
 *  Galois, Inc. (creswick)
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. The names of the contributors may not be used to endorse or promote
 * products derived from this software without specific prior written
 * permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *
 */
package com.galois.fiveui;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.BindException;
import java.util.Collection;
import java.util.List;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

/**
 * @author creswick
 *
 */
@RunWith(Parameterized.class)
public class HeadlessRunnerTest {
	private static Logger logger = 
			Logger.getLogger(HeadlessRunnerTest.class);

	static {
		BasicConfigurator.configure();
        logger.setLevel(Level.DEBUG);
        Logger root = Logger.getRootLogger();
        root.setLevel(Level.ERROR);
	}

	/**
	 * Set up the tests via the parameterized runner:
	 * 
	 * @return
	 * @throws Throwable
	 */
	@Parameters(name = "{0} {1}")
	public static Collection<Object[]> buildtests() throws Throwable {

		List<Object[]> tests = Lists.newArrayList();
		
		// webRoot, startingUrl, runDescr, oracle
		Object[][] rawTests = new Object[][] {
				{ "../../../exampleData/sites/",
				  "src/test/resources/runDescriptions/headlessSample1.json", 
				  ImmutableList.of(Result.error(null, "Headings are capitalized"),
						  Result.error(null, "Headings are capitalized"),
						  Result.error(null, "Disallow Empty Headers"))
				},
				{
				  "../../../exampleData/sites/",
				  "src/test/resources/runDescriptions/headlessSample4.json", 
				  ImmutableList.of(Result.error(null, "Generate Errors"))
				},
				{
					  "../../../exampleData/sites/",
					  "src/test/resources/runDescriptions/headlessSample3.json", 
					  ImmutableList.of(Result.error(null, "Generate Errors - custom"))
			    }
				};
		
		for (Object[] descr : rawTests) {
			tests.add(descr);
		}
		
		return tests;
	}
	
	private final String _webRoot;
	
	private final String _runDescrPath;
	
	private final ImmutableList<Result> _oracle;
	
	private NanoHTTPD _httpServer;
	
	public HeadlessRunnerTest(String webRoot, String runDescrPath,
			ImmutableList<Result> oracle) {
		super();
		this._webRoot = webRoot;
		this._runDescrPath = runDescrPath;
		this._oracle = oracle;
	}

	@Before
	public void setup() {
		File dir = new File(_webRoot);
		int port = 8000;
		logger.info("Starting NanoHTTPD webserver in " + dir.getAbsolutePath() + " on port "+port);
		try {
			_httpServer = new NanoHTTPD(port, dir);
		} catch (BindException e) {
			logger.debug("assuming that local web server is already running");
		} catch (IOException e1) {
			e1.printStackTrace();
			Assert.assertTrue("failed to start NanoHTTPD in current directory " + dir.getAbsolutePath(), false);
		}
	}
	
	@After
	public void teardown() {
		_httpServer.stop();
	}
	
	@Test
	public void test() throws FileNotFoundException {
		HeadlessRunDescription descr =
				HeadlessRunDescription.parse(_runDescrPath);
		BatchRunner runner = new BatchRunner();
		ImmutableList<Result> actual = runner.runHeadless(descr);
		Assert.assertEquals("Expected results differ from actual.", _oracle, actual);
	}

}
