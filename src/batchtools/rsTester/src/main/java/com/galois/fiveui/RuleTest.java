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
import java.util.Collection;

import com.google.common.collect.ImmutableMultiset;

/**
 * A RuleTest object encapsulates the following data: 
 * <ol>
 *   <li> a URI on which to run rules, accessed using {@code getUri}</li>
 *   <li> a RuleSet object encapsulating the rule to run on the URI</li>
 *   <li> a rule ID, signifying we expect results for the corresponding rule
 *        (defined in the rule set) of the type(s) given in the oracle</li>
 *   <li> an oracle, the expected results of the test</li>
 * </ol>
 *
 * @author creswick
 *
 */
public class RuleTest {
    
    private final URI _uri;
    private final RuleSet _ruleSet;
    private final String _ruleName;
    private final ImmutableMultiset<ResType> _oracle;

    public RuleTest(URI uri, RuleSet ruleSet, String ruleName, Collection<ResType> oracle) {
        _uri = uri;
        _ruleSet = ruleSet;
        _ruleName = ruleName;
        _oracle = ImmutableMultiset.copyOf(oracle);
    }
    
    public Rule getRule() {
      return _ruleSet.getRule(_ruleName);
    }

    public URI getUri() {
        return _uri;
    }

    public RuleSet getRuelSet() {
        return _ruleSet;
    }

    public String getRuleName() {
        return _ruleName;
    }

    public ImmutableMultiset<ResType> getOracle() {
        return _oracle;
    }

    
}
