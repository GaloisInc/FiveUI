/**
 * Module     : Config.java
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

import java.net.URI;

import com.google.common.collect.ImmutableList;

public class Config {
	private final ImmutableList<String> _ruleSets;
	private final ImmutableList<URI> _testUrls;
	
   public Config(ImmutableList<String> immutableList, ImmutableList<URI> testUrls) {
      
      this._ruleSets = immutableList;
      this._testUrls = testUrls;
   }

   public ImmutableList<String> getRuleSets() {
      return _ruleSets;
   }

   public ImmutableList<URI> getTestUrls() {
      return _testUrls;
   }

   @Override
   public String toString() {
      StringBuilder builder = new StringBuilder("Urls:\n");
      for (URI uri : _testUrls) {
         builder.append("  "+uri.toString());
      }
      builder.append("\n");
      builder.append("Rule Sets:\n");
      for (String rs : _ruleSets) {
         builder.append("Rule Set:\n");
         builder.append("  "+rs);
      }
      return builder.toString();
   }
}
