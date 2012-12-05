/**
 * Module : HeadlessRunner.java Copyright : (c) 2011-2012, Galois, Inc.
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
 */
package com.galois.fiveui;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URISyntaxException;

import com.galois.fiveui.Result;
import com.google.common.collect.ImmutableList;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.GnuParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.OptionBuilder;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.BasicConfigurator;

/**
 * The main entry point for running headless rule set runs.
 * <p>
 * The {@link #main(String[])} method of this class sets up a WebDriver, loads
 * a headless run description from disk, and executes the run which includes
 * loading seed URL's, performing a webcrawl, and running rule sets on each of
 * the crawled pages.
 * 
 * @author bjones
 * 
 */
public class HeadlessRunner {

	private static Logger logger = Logger.getLogger("com.galois.fiveui.HeadlessRunner");
	
    /**
     * @param args list of headless run description filenames
     * @throws IOException
     * @throws URISyntaxException
     */
    @SuppressWarnings("static-access")
	public static void main(final String[] args)
    	throws IOException, URISyntaxException {

    	// Setup command line options
    	Options options = new Options();
        Option help = new Option( "h", "print this help message" );
        Option output = OptionBuilder.withArgName("outfile")
        		                     .hasArg()
        		                     .withDescription("write output to file")
        		                     .create("o");
        options.addOption(output);
        options.addOption("v", false, "verbose output");
        options.addOption("vv", false, "VERY verbose output");
        options.addOption(help);
 
        // Parse command line options
        CommandLineParser parser = new GnuParser();
        CommandLine cmd = null;
        try {
			cmd = parser.parse( options, args);
		} catch (ParseException e) {
			System.err.println( "Command line option parsing failed.  Reason: " + e.getMessage() );
			System.exit(1);
		}
        
        // Display help if requested
        if (cmd.hasOption("h")) {
        	HelpFormatter formatter = new HelpFormatter();
        	formatter.printHelp("headless", options);
        	System.exit(1);
        }	
        
        // Set logging levels
        BasicConfigurator.configure();
        Logger fiveuiLogger = Logger.getLogger("com.galois.fiveui");
        Logger rootLogger = Logger.getRootLogger();
        if (cmd.hasOption("v")) {
        	fiveuiLogger.setLevel(Level.DEBUG);
        	rootLogger.setLevel(Level.ERROR);
        } else if (cmd.hasOption("vv")) {
        	fiveuiLogger.setLevel(Level.DEBUG);
        	rootLogger.setLevel(Level.DEBUG);
        } else {
        	fiveuiLogger.setLevel(Level.ERROR);
        	rootLogger.setLevel(Level.ERROR);
        }
        
        // Setup output file if requested
        PrintWriter outStream = null;
        if (cmd.hasOption("o")) {
        	String outfile = cmd.getOptionValue("o");
        	try {
        		outStream = new PrintWriter(new BufferedWriter(new FileWriter(outfile)));
        	} catch (IOException e) {
        		System.err.println("Could not open outfile for writing: " + cmd.getOptionValue("outfile"));
        		System.exit(1);
        	}
        } else {
        	outStream = new PrintWriter(new BufferedWriter(new PrintWriter(System.out)));
        }
    	 
        // Process input files
        for (String in: cmd.getArgs()) {
            logger.debug("parsing headless run description: " + in);
         	HeadlessRunDescription descr = HeadlessRunDescription.parse(in);
        	logger.debug("invoking headless run...");
        	BatchRunner runner = new BatchRunner();
            ImmutableList<Result> results = runner.runHeadless(descr);
            logger.debug("runHeadless returned " + results.size() + " results");
            for (Result result : results) {
                outStream.println(result.toString());
            }
            outStream.flush();
        }
        outStream.close();
    }
}
