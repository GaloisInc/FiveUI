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
import java.util.List;

import com.google.common.collect.ImmutableList;

public class URITest {

    private URI uri;
    private int id;
    private List<ResType> oracle;

    /**
     * Deserialization constructor.
     */
    URITest() {}
    
//    public URITest(URI uri, RuleSet ruleSet, ResType oracle) {
//        assert(1 == ruleSet.getRules().size());
//        
//        this._uri = uri;
//        this._ruleSet = ruleSet;
//        this._oracle = oracle;
//    }

    public URI getUri() {
        return uri;
    }
    
    public int getId() {
        return id;
    }
    
    public ImmutableList<ResType> getOracle() {
        return ImmutableList.copyOf(oracle);
    }
}
