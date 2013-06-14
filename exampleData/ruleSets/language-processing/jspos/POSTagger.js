/*!
 * jsPOS
 *
 * Copyright 2010, Percy Wegmann
 * Licensed under the LGPLv3 license
 * http://www.opensource.org/licenses/lgpl-3.0.html
 * 
 * Enhanced by Toby Rahilly to use a compressed lexicon format as of version 0.2.
 */

function POSTagger(){
    this.lexicon = POSTAGGER_LEXICON;
    this.tagsMap = LEXICON_TAG_MAP;
}

/**
 * Indicates whether or not this string starts with the specified string.
 * @param {Object} string
 */
String.prototype.startsWith = function(string){
    if (!string) 
        return false;
    return this.indexOf(string) == 0;
}

/**
 * Indicates whether or not this string ends with the specified string.
 * @param {Object} string
 */
String.prototype.endsWith = function(string){
    if (!string || string.length > this.length) 
        return false;
    return this.indexOf(string) == this.length - string.length;
}

POSTagger.prototype.wordInLexicon = function(word){
    var ss = this.lexicon[word];
    if (ss != null) 
        return true;
    // 1/22/2002 mod (from Lisp code): if not in hash, try lower case:
    if (!ss) 
        ss = this.lexicon[word.toLowerCase()];
    if (ss) 
        return true;
    return false;
}

POSTagger.prototype.tag = function(words){
    var ret = new Array(words.length);
    for (var i = 0, size = words.length; i < size; i++) {
        var ss = this.lexicon[words[i]];
        // 1/22/2002 mod (from Lisp code): if not in hash, try lower case:
        if (!ss) 
            ss = this.lexicon[words[i].toLowerCase()];
        if (!ss && words[i].length == 1) 
            ret[i] = words[i] + "^";
        if (!ss) 
            ret[i] = "NN";
        else 
            ret[i] = this.tagsMap[ss][0];
    }
	
	/**
     * Apply transformational rules
     **/
    for (var i = 0; i < words.length; i++) {
        word = ret[i];
		//  rule 1: DT, {VBD | VBP} --> DT, NN
        if (i > 0 && ret[i - 1] == "DT") {
            if (word == "VBD" ||
            word == "VBP" ||
            word == "VB") {
                ret[i] = "NN";
            }
        }
        // rule 2: convert a noun to a number (CD) if "." appears in the word
        if (word.startsWith("N")) {
			if (words[i].indexOf(".") > -1) {
                ret[i] = "CD";
            }
			// Attempt to convert into a number
            if (parseFloat(words[i]))
                ret[i] = "CD";
        }
        // rule 3: convert a noun to a past participle if words[i] ends with "ed"
        if (ret[i].startsWith("N") && words[i].endsWith("ed")) 
            ret[i] = "VBN";
        // rule 4: convert any type to adverb if it ends in "ly";
        if (words[i].endsWith("ly")) 
            ret[i] = "RB";
        // rule 5: convert a common noun (NN or NNS) to a adjective if it ends with "al"
        if (ret[i].startsWith("NN") && word.endsWith("al")) 
            ret[i] = i, "JJ";
        // rule 6: convert a noun to a verb if the preceding work is "would"
        if (i > 0 && ret[i].startsWith("NN") && words[i - 1].toLowerCase() == "would") 
            ret[i] = "VB";
        // rule 7: if a word has been categorized as a common noun and it ends with "s",
        //         then set its type to plural common noun (NNS)
        if (ret[i] == "NN" && words[i].endsWith("s")) 
            ret[i] = "NNS";
        // rule 8: convert a common noun to a present participle verb (i.e., a gerund)
        if (ret[i].startsWith("NN") && words[i].endsWith("ing")) 
            ret[i] = "VBG";
    }
	var result = new Array();
	for (i in words) {
		result[i] = [words[i], ret[i]];
	}
    return result;
}

POSTagger.prototype.prettyPrint = function(taggedWords) {
	for (i in taggedWords) {
        print(taggedWords[i][0] + "(" + taggedWords[i][1] + ")");
    }
}

//print(new POSTagger().tag(["i", "went", "to", "the", "store", "to", "buy", "5.2", "gallons", "of", "milk"]));