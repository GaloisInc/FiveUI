package com.galois.fiveui;

import static org.junit.Assert.*;

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
}
