/**
 * 
 */
package com.galois.fiveui;

import java.io.File;
import java.io.IOException;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;

import com.galois.fiveui.RuleSet;
import com.galois.fiveui.Utils;

/**
 * @author bjones
 *
 */
public class HeadlessAtom {

	private String _url;
	private RuleSet _ruleSet;
	
	public HeadlessAtom(String url, RuleSet ruleSet) {
		_url = url;
		_ruleSet = ruleSet;
	}
	
	public String getURL() {
		return _url;
	}
	
	public RuleSet getRuleSet() {
		return _ruleSet;
	}
	
	public String toString() {
        Gson gson = new Gson();
        return gson.toJson(this);
    }
	
	/**
     * Parse a JSON file into a HeadlessAtom
     * 
     * @param str The string to parse
     * @return A populated HeadlessAtom object.
     */
//    public static HeadlessAtom parse(String str) 
//            throws FileNotFoundException {
//        GsonBuilder gsonBuilder = new GsonBuilder();
//        gsonBuilder.registerTypeAdapter(HeadlessAtom.class, 
//                new HeadlessAtom.Deserializer());
//        Gson gson = gsonBuilder.create();
//        return gson.fromJson(str, HeadlessAtom.class);
//    }

    /**
     * Construct a HeadlessAtom from a JsonObject
     * 
     * @param obj JsonObject to convert from
     * @param dir parent directory of the filenames referenced in the ruleSet field
     * @return a HeadlessAtom POJO
     * @throws IOException 
     * @throws JsonParseException
     */
    public static HeadlessAtom fromJsonObject(JsonObject obj, String dir) throws IOException {
		String url = obj.get("url").getAsString();
		String ruleSet = obj.get("ruleSet").getAsString();

		if (url == null || ruleSet == null) {
			throw new JsonParseException("could get either 'url' or 'ruleSet' properties");
		}

		String rsPath = dir + File.separator + ruleSet;
        String ruleSetStr = Utils.readFile(rsPath);
        
        RuleSet parsed = RuleSet.parse(ruleSetStr);
        
        return new HeadlessAtom(url, parsed);
    }
    
//    public static class Deserializer implements JsonDeserializer<HeadlessAtom> {
//
//        public Deserializer() {}
//
//        public HeadlessAtom deserialize(JsonElement json, Type typeOfT,
//                JsonDeserializationContext context) throws JsonParseException {
//            JsonObject obj = json.getAsJsonObject();
//            try {
//				return HeadlessAtom.fromJsonObject(obj);
//			} catch (IOException e) {
//				e.printStackTrace();
//				// TODO bad stop gap
//				return new HeadlessAtom(null, null);
//			}
//        }
//    }
	
	@Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((_url == null) ? 0 : _url.hashCode());
        result = prime * result + ((_ruleSet == null) ? 0 : _ruleSet.hashCode());
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
        HeadlessAtom other = (HeadlessAtom) obj;
        if (_url == null) {
            if (other._url != null)
                return false;
        } else if (!_url.equals(other._url))
            return false;
        if (_ruleSet == null) {
            if (other._ruleSet != null)
                return false;
        } else if (!_ruleSet.equals(other._ruleSet))
            return false;
        return true;
    }
	
}
