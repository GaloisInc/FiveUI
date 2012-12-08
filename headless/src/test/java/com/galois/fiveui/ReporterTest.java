/**
 * Module : Reporter.java Copyright : (c) 2012, Galois, Inc.
 *
 * Maintainer : Stability : Provisional Portability: Portable
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 * 
 * @author Benjamin Jones <bjones@galois.com>
 */
package com.galois.fiveui;

import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import org.junit.Test;

import com.google.common.collect.ImmutableList;

public class ReporterTest {
	
	@Test
    public void testConstructor() {
		ImmutableList<Result> r = ImmutableList.of(
				Result.pass(null, "OK", "http://nonexistant", "test rule 1"),
				Result.pass(null, "OK", "http://intransigent", "test rule 1"),
				Result.error(null, "ERROR", "http://nonexistant", "test rule 2"));
		Reporter kermit = new Reporter(r);
		System.out.println("Summary page size: " + kermit.getSummary().length() + " bytes");
		System.out.println("Summary page size: " + kermit.getByURL().length() + " bytes");
		System.out.println("Summary page size: " + kermit.getByRule().length() + " bytes");
		assertTrue(kermit.getSummary().length() > 0 &&
				   kermit.getByURL().length() > 0   &&
				   kermit.getByRule().length() > 0);
    }
	
	@Test
	public void testSummaryPage() throws IOException {
		//File tmpPath = Files.createTempDir();
		File tmpPath = new File("/tmp/");
		System.out.println("Writing test summary page to: " + tmpPath.toString() + File.separator);
		ImmutableList<Result> r = ImmutableList.of(
				Result.pass(null, "OK", "http://nonexistant", "test rule 1"),
				Result.pass(null, "OK", "http://intransigent", "test rule 1"),
				Result.pass(null, "OK", "http://intransigent", "test rule 3"),
				Result.pass(null, "OK", "http://intransigent", "test rule 4"),
				Result.pass(null, "OK", "http://intransigent", "test rule 5"),
				Result.pass(null, "OK", "http://foo.com", "test rule 1"),
				Result.error(null, "ERROR", "http://foo.com", "test rule 5"),
				Result.error(null, "ERROR", "http://foo.com", "test rule 2"),
				Result.error(null, "ERROR", "http://bar.com", "test rule 3"),
				Result.error(null, "ERROR", "http://bar.com", "test rule 3"), // multiple fails for same url+rule combo
				Result.error(null, "ERROR", "http://bar.com", "test rule 3"),
				Result.error(null, "ERROR", "http://bar.com", "test rule 3"),
				Result.error(null, "ERROR", "http://nonexistant", "test rule 2"));
		Reporter kermit = new Reporter(r);
		kermit.writeReportsToDir(tmpPath.toString());
		assertTrue("made it!", true);
	}
}
