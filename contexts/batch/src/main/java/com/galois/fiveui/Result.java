/**
 * Module : Result.java Copyright : (c) 2011-2012, Galois, Inc.
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

public class Result {

    public static Result exception(String res) {
        return new Result(ResType.Exception, res);
    }
    
    public static Result pass(String res) {
        return new Result(ResType.Pass, res);
    }
    
    public static Result error(String res) {
        return new Result(ResType.Error, res);
    }

    public static Result warning(String res) {
        return new Result(ResType.Warning, res);
    }
    
    private final ResType _type;
    private final String _desc;

    private Result(ResType type, String desc) {
        super();
        _type = type;
        _desc = desc;
    }

    public ResType getType() {
        return _type;
    }

    public String getDesc() {
        return _desc;
    }

    @Override
    public String toString() {
        return getType() + ": " + getDesc();
    }
}
