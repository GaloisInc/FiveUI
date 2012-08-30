# Module     : Makefile
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

REPO_ROOT=.
CHROME_EXTDIR=contexts
FF_EXTDIR=contexts
TEST_RUNNER_DIR=testrunner
DOC_DIR=doc

UNAME := $(shell uname)
ifeq ($(UNAME), Linux)
MVN_EXE=`which mvn`
# MVN_EXE=/usr/local/apache-maven-3.0.4/bin/mvn
else
# Non-Linux platfoms not yet supported
MVN_EXE=""
endif

define profile
.PHONY: profile-$1
profile-$1: $(REPO_ROOT)/profiles/$1/.token

$(REPO_ROOT)/profiles/$1/.token: $(REPO_ROOT)/profiles/$1.tar
	$(MAKE) -C $(REPO_ROOT)/profiles $1

.PHONY: clean-profile-$1
clean-profile-$1:
	$(MAKE) -C $(REPO_ROOT)/profiles clean-$1

clean: clean-profile-$1
endef

MVN_TEST_CMD=xvfb-run -a $(MVN_EXE) test

all: chromeExtension

ffExtension:
	@make -C $(FF_EXTDIR)
chromeExtension:
	@make -C $(CHROME_EXTDIR)


cleanOSS:
	@make -C $(FF_EXTDIR) clean
	@make -C $(CHROME_EXTDIR) clean
	@make -C $(DOC_DIR) clean


$(eval $(call profile,firefox))

$(eval $(call profile,chrome))

test: chromeExtension profile-chrome profile-firefox
	cd $(TEST_RUNNER_DIR) && $(MVN_TEST_CMD)

.PHONY: doc
doc: doc/jsdoc doc/manual
doc/jsdoc:
	@make -C $(DOC_DIR)

doc/manual:
	@make -C $(DOC_DIR) man

clean: cleanOSS