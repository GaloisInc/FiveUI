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

import java.util.Collection;
import java.util.List;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

import com.google.common.collect.Lists;

/**
 * @author creswick
 *
 */
@RunWith(Parameterized.class)
public class BasicRuleSetParseTest {

	/**
	 * Set up the tests via the parameterized runner:
	 * 
	 * @return
	 * @throws Throwable
	 */
	@Parameters(name = "{0} {1}")
	public static Collection<Object[]> setup() throws Throwable {
		List<Object[]> tests = Lists.newArrayList();
		
		Object[][] rawTests = new Object[][] {
				{ "ruleSets/emptyRuleSet.json", true },
				{ "ruleSets/simpleRuleSet1.json", true },
				{ "ruleSets/headingGuidelines.json", true },
				};
		
		for (Object[] descr : rawTests) {
			tests.add(descr);
		}
		
		return tests;
	}
	
	/**
	 * The path (relative to test resources) to the file to test.
	 */
	private final String _filePath;
	
	private final boolean _parses;
	
	public BasicRuleSetParseTest(String path, boolean parses) {
		this._filePath = path;
		this._parses = parses;
	}
	
	/**
	 * Try and parse the file, no oracle other than the expected success/fail.
	 * 
	 * @throws Exception
	 */
	@Test
	public void testParse() throws Exception{
		boolean actual = false;
		String msg = "";
		try {
			RuleSet desc = RuleSet.parseFile("src/test/resources/"+_filePath);
			// if desc is not null, we assume the parse worked:
			actual = (desc != null);
		} catch (Exception e) {
			// if an exception was thrown, then we assume the parse failed:
			msg = e.getMessage();
			actual = false;
		} finally {
			// test to see if the parse result matched the expectation.
			Assert.assertEquals("Parse did not complete as expected: "+msg, 
					_parses, actual);
		}
	}
}
