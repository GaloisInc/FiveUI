/**
 * Module : URITest.java Copyright : (c) 2011-2012, Galois, Inc.
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

import java.net.URI;

public class URITest {

    private final URI _uri;
    private final RuleSet _ruleSet;

    public URITest(URI uri, RuleSet ruleSet) {
        assert(1 == ruleSet.getRules().size());
        
        this._uri = uri;
        this._ruleSet = ruleSet;
    }

    public URI getUri() {
        return _uri;
    }

    public Rule getRule() {
        return _ruleSet.getRules().get(0);
    }
    
    public RuleSet getRuleSet() {
        return _ruleSet;
    }
}
