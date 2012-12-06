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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
	private static Map<String, int[]> passFailMap = new HashMap<String, int[]>();
	
    /**
     * @param args list of headless run description filenames
     * @throws IOException
     * @throws URISyntaxException
     * @throws ParseException 
     */
    @SuppressWarnings("static-access")
	public static void main(final String[] args)
    	throws IOException, URISyntaxException, ParseException {

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
        	formatter.printHelp("headless <input file 1> [<input file 2> ...]", options);
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
         	HeadlessRunDescription descr = HeadlessRunDescription.parse(in);
        	logger.debug("invoking headless run...");
        	BatchRunner runner = new BatchRunner();
            ImmutableList<Result> results = runner.runHeadless(descr);
            logger.debug("runHeadless returned " + results.size() + " results");
            updateStats(results);
            // write results to the output stream as we go
            for (Result result : results) {
                outStream.println(result.toString());
            }
            outStream.flush();
        }
        
        reportStats();
        outStream.close();
    }

    /**
     * Update the global frequency map we're using to keep track of unique URLs,
     * passes, and fails.
     */
    private static void updateStats(List<Result> results) throws ParseException {  
    	// compute statistics on results
        String url;
        int pass, fail;
        int[] passFailList;
        Pattern numberPassedPattern = Pattern.compile("passed ([0-9]+) tests");
        Matcher matcher;
      
        for (Result result : results) {
        	pass = fail = 0;
        	url = result.getURL();
        	if (result.getType() == ResType.Pass) {
        		// now we have to parse out how many tests passed
        		matcher = numberPassedPattern.matcher(result.getDesc());
        		if (matcher.find()) {
	        		try {
	        			pass = Integer.parseInt(matcher.group(1));
	        		} catch (Exception e) {
	        			e.printStackTrace();
	        			logger.error("error parsing pass rate from \"" + result.getDesc() + "\"");
	        		}
        		}
        	} else if (result.getType() == ResType.Error) {
        		// each error result corresponds to one test
        		fail = 1;
        	}
        	
        	if (passFailMap.containsKey(url)) {
        		passFailList = passFailMap.get(url);
        	} else {
        		passFailList = new int[] { 0, 0};
        		passFailMap.put(url, passFailList);
        	}
    		passFailList[0] += pass;
    		passFailList[1] += fail;
    		//passFailMap.put(url, passFailList);
        }
    }
    
    /**
     * Report statistics on the headless run to the log. Note, "pass"
     * means the URL passed all tests in the ruleset, but "fail" can be
     * reported for the same test on multiple offenders in the page.
     */
    private static void reportStats() {
    	// report statistics on results
        int uniqueURLs = passFailMap.size();
        String stats = "\n\nRESULT STATISTICS\n\n"; // update as we go
        int pass, fail;
        int[] passFailList;
        
        stats += "Unique URLs: " + uniqueURLs + "\n";
        for (String key: passFailMap.keySet()) {
        	passFailList = passFailMap.get(key);
        	pass = passFailList[0];
        	fail = passFailList[1];
        	stats += String.format("URL: %s, pass: %3d, fail %3d\n",
        		(key.length()>40 ? key.substring(0,37)+"..." : key + sp(40-key.length())),
        		pass, fail, pass+fail);
        }
        for (String s: stats.split("\n"))
        	logger.info(s);
    }
    
    /**
     * return a string of n spaces
     */
    private static String sp(int n) {
    	String s = "";
    	for (int i=0; i<n; i++)
    		s += " ";
    	return s;
    }
    
}

