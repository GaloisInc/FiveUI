package com.galois.fiveui;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.lang.reflect.Type;
import java.net.URI;
import java.util.List;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableList.Builder;
import com.google.common.collect.Lists;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;

/**
 * RSTestDescriptions represent a set of tests for a specific RuleSet.
 * 
 * RSTestDescriptions are also JSON-serializiable (and deserializable).
 * 
 * An example of the JSON is given below:
 * 
 * <pre>
 * {@code
 * { 'ruleSet': '../../exampleData/ruleSets/headingGuidelines.json',
 *   'tests': [ { 'url': 'http://localhost:8000/exampleData/basic/headings.html',
 *                'oracle': [ { 'ruleName': "Headings are capitalized"
 *                            , 'results': ['Error', 'Error']
 *                            },
 *                            { 'ruleName': "Disallow Empty Headers"
 *                            , 'results': ['Error']
 *                            }
 *                          ]
 *              }
 *            ]
 * }
 * }
 * </pre>
 * 
 * {@code tests} is as list that may contain a number of urls and sets of 
 * expected Problems for the specified rule set and url combination.
 * 
 * {@code ruleSet} is a string file path that is relative to the rule set 
 * description json file.
 * 
 * @author creswick
 *
 */
public class RSTestDescription {

    /**
     * Parse a JSON file into a RSTestDescription
     * 
     * @param runDescFileName The file to load.
     * @return A populated RunDescription object.
     * @throws FileNotFoundException if runDescFile can't be found.
     */
    public static RSTestDescription parse(String runDescFileName) 
            throws FileNotFoundException {

        GsonBuilder gsonBuilder = new GsonBuilder();
        gsonBuilder.registerTypeAdapter(RSTestDescription.class, 
                new RSTestDescription.Deserializer(runDescFileName));
        Gson gson = gsonBuilder.create();
        
        Reader in = new InputStreamReader(new FileInputStream(runDescFileName));
        
        return gson.fromJson(in, RSTestDescription.class);
    }

    public static class Deserializer implements JsonDeserializer<RSTestDescription> {

        private final String _descFile;

        public Deserializer(String descFile) {
            _descFile = descFile;
        }

        public RSTestDescription deserialize(JsonElement json, Type typeOfT,
                JsonDeserializationContext context) throws JsonParseException {
            
            JsonObject obj = json.getAsJsonObject();
            
            String ruleSet = obj.get("ruleSet").getAsString();
            JsonArray testArray = obj.get("tests").getAsJsonArray();
            
            List<URIMap> tests = Lists.newArrayList(); 
            for (JsonElement jsonElement : testArray) {
                tests.add((URIMap)context.deserialize(jsonElement, URIMap.class));
            }
            
            String descDir = new File(_descFile).getParent();
            if (null == descDir) {
                descDir = ".";
            }
            
            // This probably is not portable, because the ruleSet path separator
            // may not match that of the file system.
            // TODO if File.separator is not "/", then replace "\" with File.separator.
            String rsPath = descDir + File.separator + ruleSet;

            RuleSet parsed;
			try {
				parsed = RuleSet.parseFile(rsPath);
			} catch (IOException e) {
				e.printStackTrace();
				throw new JsonParseException(e.getMessage());
			}
            //RuleSet parsed = gson.fromJson(rsPath, RuleSet.class);
            
            return new RSTestDescription(rsPath, tests, parsed);
        }
    }
    
    /**
     * The path to the selected rule set.
     */
    private final String _ruleSetLoc;
    
    /**
     * A list of urls and oracles that define tests for the specified RuleSet.
     */
    private final List<URIMap> _tests;

    private final RuleSet _ruleSet;
    
    public RSTestDescription(String ruleSetLoc, List<URIMap> tests, RuleSet ruleSet) {
        _ruleSetLoc = ruleSetLoc;
        _tests   = tests;
        _ruleSet = ruleSet;
    }

    public RuleSet getRuleSet() {
        return _ruleSet;
    }

    public String getRuleSetLoc() {
        return _ruleSetLoc;
    }

    /**
     * Combines the URI in each test from the rule set test description with
     * each rule that accompanies it.
     * <p>
     * The result is a list of RuleTest objects
     * that each contain: a URI and rule set (to be run), a rule ID and list
     * of results the we expect from the run.
     * 
     * @return a list of RuleTest objects
     * @throws IOException
     */
    public ImmutableList<RuleTest> getTests() throws IOException {
        Builder<RuleTest> builder = ImmutableList.builder();
        for (URIMap uriMap : _tests) {
            for (RuleMap rMap : uriMap.getOracle()) {
                builder.add(
                 new RuleTest(uriMap.getUrl(), getRuleSet(), rMap.getRuleName(), rMap.getResults()));
            }
        }
        return builder.build();
    }
    
    public String toString() {
        Gson gson = new Gson();
        return gson.toJson(this);
    }

    @Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((_ruleSet == null) ? 0 : _ruleSet.hashCode());
		result = prime * result
				+ ((_ruleSetLoc == null) ? 0 : _ruleSetLoc.hashCode());
		result = prime * result + ((_tests == null) ? 0 : _tests.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		RSTestDescription other = (RSTestDescription) obj;
		if (_ruleSet == null) {
			if (other._ruleSet != null)
				return false;
		} else if (!_ruleSet.equals(other._ruleSet))
			return false;
		if (_ruleSetLoc == null) {
			if (other._ruleSetLoc != null)
				return false;
		} else if (!_ruleSetLoc.equals(other._ruleSetLoc))
			return false;
		if (_tests == null) {
			if (other._tests != null)
				return false;
		} else if (!_tests.equals(other._tests))
			return false;
		return true;
	}

	public static class URIMap {
        private URI url;
        private List<RuleMap> oracle;
        
        URIMap(){}

        public URIMap(URI url, List<RuleMap> oracle) {
			super();
			this.url = url;
			this.oracle = oracle;
		}

        public URI getUrl() {
            return url;
        }

        public List<RuleMap> getOracle() {
            return oracle;
        }

		@Override
		public int hashCode() {
			final int prime = 31;
			int result = 1;
			result = prime * result
					+ ((oracle == null) ? 0 : oracle.hashCode());
			result = prime * result + ((url == null) ? 0 : url.hashCode());
			return result;
		}

		@Override
		public boolean equals(Object obj) {
			if (this == obj)
				return true;
			if (obj == null)
				return false;
			if (getClass() != obj.getClass())
				return false;
			URIMap other = (URIMap) obj;
			if (oracle == null) {
				if (other.oracle != null)
					return false;
			} else if (!oracle.equals(other.oracle))
				return false;
			if (url == null) {
				if (other.url != null)
					return false;
			} else if (!url.equals(other.url))
				return false;
			return true;
		}
    }
    
    public static class RuleMap {
        private String ruleName;
        private List<ResType> results;
        
        public RuleMap(String ruleName, List<ResType> results) {
			super();
			this.ruleName = ruleName;
			this.results = results;
		}
        
        public String getRuleName() {
            return ruleName;
        }
        
        public List<ResType> getResults() {
            return results;
        }

		@Override
		public int hashCode() {
			final int prime = 31;
			int result = 1;
			result = prime * result
					+ ((results == null) ? 0 : results.hashCode());
			result = prime * result
					+ ((ruleName == null) ? 0 : ruleName.hashCode());
			return result;
		}

		@Override
		public boolean equals(Object obj) {
			if (this == obj)
				return true;
			if (obj == null)
				return false;
			if (getClass() != obj.getClass())
				return false;
			RuleMap other = (RuleMap) obj;
			if (results == null) {
				if (other.results != null)
					return false;
			} else if (!results.equals(other.results))
				return false;
			if (ruleName == null) {
				if (other.ruleName != null)
					return false;
			} else if (!ruleName.equals(other.ruleName))
				return false;
			return true;
		}
    }

}
