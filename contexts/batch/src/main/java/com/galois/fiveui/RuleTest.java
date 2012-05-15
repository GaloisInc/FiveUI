/**
 * Module     : RuleTest.java
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

/**
 * @author creswick
 *
 */
public class RuleTest {
    
    private final URI _uri;
    private final RuleSet _ruleSet;
    private final int _ruleId;
    private final ResType _oracle;

    public RuleTest(URI uri, RuleSet ruleSet, int ruleId, ResType oracle) {
        _uri = uri;
        _ruleSet = ruleSet;
        _ruleId = ruleId;
        _oracle = oracle;
    }
    
    public RuleSet getRule() {
      RuleSet newRS = new RuleSet(_ruleSet.getName(), 
              _ruleSet.getDescription(), ImmutableList.of(_ruleSet.getRule(_ruleId)));
      return newRS;
    }

    public URI getUri() {
        return _uri;
    }

    public RuleSet getRuelSet() {
        return _ruleSet;
    }

    public int getRuleId() {
        return _ruleId;
    }

    public ResType getOracle() {
        return _oracle;
    }

    
}
