package com.galois.fiveui;

import java.io.IOException;
import java.net.URI;
import java.util.List;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableList.Builder;
import com.google.gson.Gson;

public class RunDescription {

    private String ruleSet;
    private List<URIMap> tests;

    private transient RuleSet _parsedRuleSet;
    
    /**
     * Empty constructor for Gson deserialization.
     */
    RunDescription() {}

    public RuleSet getRuleSet() throws IOException {
        String ruleSetStr = Utils.readFile(ruleSet);
        if (null == _parsedRuleSet) {
            _parsedRuleSet = RuleSet.parse(ruleSetStr);    
        }
        
        return _parsedRuleSet;
    }

    public ImmutableList<RuleTest> getTests() throws IOException {
        Builder<RuleTest> builder = ImmutableList.builder();
        for (URIMap uriMap : tests) {
            for (RuleMap rMap : uriMap.oracle) {
                for (ResType oracle : rMap.results) {
                    builder.add(
                       new RuleTest(uriMap.url, getRuleSet(), rMap.ruleId, oracle));
                }
            }
        }
        return builder.build();
    }
    
    public String toString() {
        Gson gson = new Gson();
        return gson.toJson(this);
    }
    
    private static class URIMap {
        public URI url;
        public List<RuleMap> oracle;
        
        URIMap(){};
    }
    
    private static class RuleMap {
        public int ruleId;
        public List<ResType> results;
    }
}
