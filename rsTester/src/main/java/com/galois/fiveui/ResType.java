/**
 * Module : ResType.java Copyright : (c) 2011-2012, Galois, Inc.
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

/**
* Results are organized into categories as follows:
* <ol>
*   <li> exception: an uncaught exception occurred while running the rule set</li>
*   <li> pass: the expected result was returned</li>
*   <li> error: an unexpected result was returned</li>
*   <li> warning: a warning was returned, currently this type is unused</li>
* </ol>
*/
public enum ResType {
    Pass, Error, Warning, Exception
}