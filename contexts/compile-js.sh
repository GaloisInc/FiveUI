#!/bin/bash
#
# Module     : compile-js.sh
# Copyright  : (c) 2011-2012, Galois, Inc.
#
# Maintainer :
# Stability  : Provisional
# Portability: Portable
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

dir=`dirname $0`

closure="$dir/data/lib/closure-library"

closurebuilder="${closure}/closure/bin/build/closurebuilder.py"

${closurebuilder} --root="$dir/data/fiveui" --root="${closure}" $@ | \
	sed 's|COMPILED = false|COMPILED = true|'