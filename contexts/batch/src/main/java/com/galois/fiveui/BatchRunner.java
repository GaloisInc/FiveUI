/**
 * Module     : BatchRunner.java
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
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableList.Builder;
import com.google.common.io.CharStreams;

public class BatchRunner {
   
   private final WebDriver _driver;
   private final JavascriptExecutor _exe;
   
   // Relative to the batch directory.
   private static final String DATA_DIR = "../data/";
   private static final String J_QUERY_JS = DATA_DIR + "lib/jquery/jquery-1.7.1.min.js";
   private static final String PRELUDE_JS = DATA_DIR + "fiveui/injected/prelude.js";
   private static final String EVAL_JS = "/javascript/ruleEval.js";
   
   
   public BatchRunner(WebDriver driver) {
      _driver = driver;
      _exe = (JavascriptExecutor) _driver;
   }

   public void runTests(ImmutableList<URITest> build) {
      for (URITest uriTest : build) {
         _driver.get(uriTest.getUri().toString());
         for (Rule rule : uriTest.getRules()) {
            try {
               List<Result> results = runRule(rule.getRule());
               for (Result result : results) {
                  System.out.println(result);   
               }
            } catch (IOException e) {
               System.err.println("Could not run rule: "+ rule.getName());
               e.printStackTrace();
            }
         }
      }
   }

   private ImmutableList<Result> runRule(final String rule) throws IOException {
      String contentScript = wrapRule(rule);
      
      Object res = _exe.executeScript(contentScript);
      if (res.getClass() == String.class) {
         // report an error...
         System.err.println("Exception running rule: "+res);
         return ImmutableList.of(Result.exception((String)res));
      } else {
         Builder<Result> builder = ImmutableList.builder();
         
         for (Object r : (List<Object>)res) {
            System.out.println("Result: "+r.toString());
         }

         return builder.build();
      }
   }
   
   /**
    * Build up the complete content script needed to run the rule
    * @throws IOException 
    */
   private String wrapRule(String rule) throws IOException {
      String jquery_js = Utils.readStream(new FileInputStream(
                                        new File(J_QUERY_JS)));
      String prelude_js = Utils.readStream(new FileInputStream(
                                        new File(PRELUDE_JS)));
      String eval_js = Utils.readStream(getClass().getResourceAsStream(EVAL_JS));
      String exeRule = "return eval("+rule+");";
      
      return jquery_js +"; \n"+ prelude_js + "; \n" + eval_js + "; \n" + exeRule; 
   }
}
