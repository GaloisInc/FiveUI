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



# Entry Point ##################################################################

.PHONY: all
all:

.PHONY: unpack
unpack:

.PHONY: clean
clean::

# Utilities ####################################################################

topdir := $(CURDIR)
path   := .

include mk/util.mk
include mk/subdir.mk

ifeq "$(shell ls ./Config.mk 2>/dev/null)" ""
$(warning No Config.mk found, installing a default)
Config.mk: Config.mk.sample
	$(call cmd,cp)

endif
-include Config.mk

# Build Directory Staging ######################################################

build-dir := $(topdir)/build

$(build-dir):
	$(call cmd,mkdir)

clean::
	$(RM) -r $(build-dir)


# Subdirs ######################################################################

$(eval $(call subdir,src/js/fiveui))
$(eval $(call subdir,src/js/chrome))
$(eval $(call subdir,src/js/firefox))
$(eval $(call subdir,src/js/tests))

$(eval $(call subdir,profiles))
$(eval $(call subdir,doc))


# Maven Packages ###############################################################

# Don't try to run any of this if maven isn't installed
MVN_EXE := $(shell which mvn 2>/dev/null)
ifneq "$(MVN_EXE)" ""

# package/install various maven sub-projects
MVN_TEST_CMD := xvfb-run -a $(MVN_EXE) test

define pkg
.PHONY: pkg-$1
pkg-$1:
	cd batchtools/$1 && xvfb-run -a $(MVN_EXE) install
endef

$(eval $(call pkg,rsTester))
$(eval $(call pkg,headless))

TEST_RUNNER_DIR := testrunner
HEADLESS_DIR    := batchtools/headless
RSTESTER_DIR    := batchtools/rsTester

test: fiveui.crx fiveui.xpi $(topdir)/profiles/chrome $(topdir)/profiles/firefox pkg-rsTester
#	cd $(TEST_RUNNER_DIR) && $(MVN_TEST_CMD)
	cd $(RSTESTER_DIR)    && $(MVN_TEST_CMD)
	cd $(HEADLESS_DIR)    && $(MVN_TEST_CMD)

endif
