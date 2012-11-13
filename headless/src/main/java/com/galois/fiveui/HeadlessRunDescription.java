/**
 * 
 */
package com.galois.fiveui;



import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.lang.reflect.Type;
import java.util.List;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableList.Builder;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;

/**
 * @author bjones
 *
 */
public class HeadlessRunDescription {

	private List<HeadlessAtom> _atoms;
	
	public HeadlessRunDescription (List<HeadlessAtom> atoms) {
		_atoms = atoms;
	}
	
	public List<HeadlessAtom> getAtoms() {
		return _atoms;
	}
	
	public int size() {
		return _atoms.size();
	}
	
    /**
     * Parse a JSON file into a HeadlessRunDescription
     * 
     * @param runDescFileName The file to load.
     * @return A populated HeadlessRunDescription object.
     * @throws FileNotFoundException if runDescFile can't be found.
     */
    public static HeadlessRunDescription parse(String runDescFileName) 
            throws FileNotFoundException {

        GsonBuilder gsonBuilder = new GsonBuilder();
        gsonBuilder.registerTypeAdapter(HeadlessRunDescription.class, 
                new HeadlessRunDescription.Deserializer(runDescFileName));
        Gson gson = gsonBuilder.create();
        
        Reader in = new InputStreamReader(new FileInputStream(runDescFileName));
        
        return gson.fromJson(in, HeadlessRunDescription.class);
    }

    public static class Deserializer implements JsonDeserializer<HeadlessRunDescription> {

    	private String _fn; // stores the filename on disk being parsed
    	private String _ctxDir; // stores the parent dir of _fn
    	
        public Deserializer(String fn) {
        	_fn = fn;
        	_ctxDir = new File(_fn).getParent();
            if (null == _ctxDir) {
                 _ctxDir = ".";
             }
        }
        
        public static void printErr(JsonElement json) {
        	System.err.println("HeadlessRunDescription.parse: ran into unexpected jsonElement type");
        }
        
        /**
         * Gracefully lookup property 'prop' in JsonObject 'obj'.
         * 
         * @param obj a JSON object
         * @param prop a key string to lookup in the JSON object
         * @return string property or null if the prop doesn't resolve
         */
        public static String objGetString(JsonObject obj, String prop) {
        	try {
        		return obj.get(prop).getAsString();
        	} catch (NullPointerException e) {
        		System.err.println("HeadlessRunDescription.parse: failed to lookup property: " + prop);
        		e.printStackTrace();
        		return null;
        	}
        }
        
        public HeadlessRunDescription deserialize(JsonElement json, Type typeOfT,
                JsonDeserializationContext context) throws JsonParseException {
        	
        	@SuppressWarnings("unused")
			String ruleSetDir, crawlType;
        	JsonArray arr;
        	
        	if (json.isJsonObject()) { // check if the description is an extended one
        		JsonObject obj = json.getAsJsonObject();
        		ruleSetDir = objGetString(obj, "rulePath");
        		crawlType = objGetString(obj, "crawlType"); // TODO not implemented
        		arr = obj.get("runs").getAsJsonArray();
        	} else if (json.isJsonArray()) {
        		ruleSetDir = _ctxDir;
        		crawlType = "none";
        		arr = json.getAsJsonArray();
        	} else {
        		printErr(json);
        		return new HeadlessRunDescription(null);
        	}
            
            Builder<HeadlessAtom> atoms = ImmutableList.builder();
            for (JsonElement jsonElement : arr) {
                try {
                	JsonObject obj = jsonElement.getAsJsonObject();
                	atoms.add(HeadlessAtom.fromJsonObject(obj, ruleSetDir));
                } catch (IOException e) {
                	System.err.println("HeadlessAtom.parse: error parsing ruleSet file: " + e.getMessage());
                } catch (IllegalStateException e) {
                	printErr(jsonElement);
                }
            }
            
            return new HeadlessRunDescription(atoms.build());
        }
    }
    
    public String toString() {
        Gson gson = new Gson();
        return gson.toJson(this);
    }
    
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        for (HeadlessAtom a: _atoms) {
	        result = prime * result + a.hashCode();
        }
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
        HeadlessRunDescription other = (HeadlessRunDescription) obj;
        if (_atoms == null) {
            if (other._atoms != null)
                return false;
        } else if (!_atoms.equals(other._atoms))
            return false;
        
        return true;
    }
}
