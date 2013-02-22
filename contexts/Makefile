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
all: compile package install ;


# Environment ##################################################################

BUILD_ROOT      := $(CURDIR)
REPO_ROOT       := $(CURDIR)/..
INSTALL_DIR     := $(REPO_ROOT)/binaries

ADDON_SDK       := $(REPO_ROOT)/tools/addon-sdk
BUILD_DIR       := $(REPO_ROOT)/build

CHROME_DIR      := $(BUILD_ROOT)/chrome
DATA_DIR        := $(BUILD_ROOT)/data

BIN_DIR         := $(DATA_DIR)/target
FIVEUI_DATA_DIR := $(DATA_DIR)/fiveui
LIB_DIR         := $(DATA_DIR)/lib

MV              := mv

# FiveUI project Javascript sources
js_sources := $(wildcard $(FIVEUI_DATA_DIR)/*.js)

# Namespaces, derived from the project sources.
js_namespaces := $(shell ./namespaces.awk $(js_sources))

# FiveUI project Javascript, known to contain application code, not library
# code.
js_app_sources := \
	$(FIVEUI_DATA_DIR)/options.js \
	$(FIVEUI_DATA_DIR)/firefox/firefox-options.js \
	$(FIVEUI_DATA_DIR)/chrome/chrome-options.js

# Namespaces that are known to be just applications
js_app_namespaces := $(shell ./namespaces.awk $(js_app_sources))

# Namespaces that contain only library code
js_lib_namespaces := $(foreach ns,$(js_app_namespaces),\
	$(filter-out $(ns),$(js_namespaces)))

# The path to the closure library
CLOSURE_LIB := $(DATA_DIR)/lib/closure-library


# Macros #######################################################################

# Generate a set of targets that will allow directory creation to be depended on
# by other targets.
#
# $1 - the directory name
define dir-exists
$1/.token:
	mkdir $1 && touch $$@
endef

dir-dep = $1/.token

# The ../../../../../ correpsonds to the relative path from
# goog/base.js to the context directory.
#
# $1 - The path (relative to BUILD_ROOT) to generate a root_with_prefix pair for
goog-relative = $(BUILD_ROOT)/$1 ../../../../../$1

# Remove the target of the current rule when the provided command exits on
# failure.
#
# $1 - The command to run
rm-on-failure = ( $1 || ($(RM) $@; exit 1) )

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

# General Targets ##############################################################

.PHONY: compile
compile:

.PHONY: package
package:

.PHONY: install
install:

.PHONY: clean
clean:

# Print out the value of a variable, useful for debugging.
print-%:
	@echo "$* = $($*)"

# BIN_DIR management
$(eval $(call dir-exists,$(BIN_DIR)))

clean: clean-BIN_DIR

.PHONY: clean-BIN_DIR
clean-BIN_DIR:
	@echo "Cleaning $(BIN_DIR)"
	$(RM) -r $(BIN_DIR)


# CSS Utilities ################################################################

css_bundle := $(BUILD_DIR)/css-bundle.py

# The jquery-ui css, in a form that has its image dependencies compiled in as
# base-64 encoded data.
$(BIN_DIR)/bundled.css: $(call dir-dep,$(BIN_DIR))
	cd $(LIB_DIR)/jquery/css/ui-lightness/ && \
		$(css_bundle) jquery-ui.css $@

# The injected css, with its images compiled in.
$(BIN_DIR)/injected.css: $(call dir-dep,$(BIN_DIR)) \
    $(FIVEUI_DATA_DIR)/injected/injected.css
	cd $(FIVEUI_DATA_DIR)/injected && \
		$(css_bundle) injected.css $@


# Javascript Utilities #########################################################

cl_linter       := $(BUILD_DIR)/closure-linter
#cl_compiler     := $(BUILD_DIR)/closure-compiler
#cl_typecheck    := $(BUILD_DIR)/closure-typechecker

# Files to ignore when running the linter
lint_excludes   := lib/jquery.js

# Run the linter over the project javascript sources.
.PHONY: lint
lint:
	find data/fiveui -name "*.js" | xargs $(cl_linter) --strict --exclude_files=$(lint_excludes)

closurebuilder := $(CLOSURE_LIB)/closure/bin/build/closurebuilder.py \
	--root=$(CLOSURE_LIB) --root=$(FIVEUI_DATA_DIR) \
	--compiler_jar=$(REPO_ROOT)/tools/closure_compiler/compiler.jar \
	--compiler_flags="--jscomp_error=checkTypes"

# Typecheck all the project javascript source.
.PHONY: typecheck
typecheck: $(js_sources)
	$(closurebuilder) --output_file=$(BIN_DIR)/trash.out --output_mode=compiled \
		$(foreach ns,$(js_namespaces),--namespace=$(ns)) && \
		$(RM) $(BIN_DIR)/trash.out


depswriter := /usr/bin/env $(CLOSURE_LIB)/closure/bin/build/depswriter.py

# The dependency graph for the project javascript.
$(BIN_DIR)/deps.js: $(call dir-dep,$(BIN_DIR)) $(js_sources)
	$(depswriter) --root_with_prefix="$(call goog-relative,data/fiveui)" \
		--output_file=$@

.PHONY: deps
deps: $(BIN_DIR)/deps.js;

compile: deps

closure-js := $(CLOSURE_LIB)/closure/bin/build/closurebuilder.py \
	--root=$(CLOSURE_LIB) \
	--root=$(FIVEUI_DATA_DIR) \
	--compiler_jar=$(REPO_ROOT)/tools/closure_compiler/compiler.jar \
	--compiler_flags="--accept_const_keyword" \
	--compiler_flags="--formatting=PRETTY_PRINT" \
	--output_mode="compiled"

compile-js := $(BUILD_ROOT)/compile-js.sh --output_mode=script

# Chrome Compilation ###########################################################

CHROME_OPTS := --pack-extension=$(BIN_DIR)/src \
               --pack-extension-key=$(BIN_DIR)/fiveui.pem

compile: compile-chrome

CHROME_TARGETS := $(BIN_DIR)/chrome-background.js $(BIN_DIR)/bundled.css \
	$(BIN_DIR)/chrome-options.js $(BIN_DIR)/injected.css

.PHONY: compile-chrome
compile-chrome: $(CHROME_TARGETS)

# Build the compiled chrome backend script.
$(BIN_DIR)/chrome-background.js: $(call dir-dep,$(BIN_DIR)) $(js_sources)
	$(call rm-on-failure,$(compile-js) --namespace=fiveui.chrome.background > $@)

# Build the compiled options script.
$(BIN_DIR)/chrome-options.js: $(call dir-dep,$(BIN_DIR)) $(js_sources)
	$(call rm-on-failure,$(compile-js) \
		--namespace=fiveui.chrome.options.init > $@)

# Clean chrome extension build artifacts.
.PHONY: clean-chrome
clean-chrome:
	@echo Cleaning Chrome extension...
	$(RM) fiveui.crx

clean: clean-chrome


# Firefox Compilation ##########################################################

# Sources the correct environment before invoking the cfx command.
#
# $1 - The desired arguments to the cfx command.
cfx = ( cd $(ADDON_SDK) > /dev/null && \
        . bin/activate  > /dev/null && \
        cd -            > /dev/null && \
        cfx $1)

.PHONY: firefox
firefox: package-firefox

$(eval $(call profile,firefox))

compile: compile-firefox

FIREFOX_TARGETS := profile-firefox $(BIN_DIR)/firefox-main.js \
	$(BIN_DIR)/bundled.css $(BIN_DIR)/firefox-options.js \
	$(BIN_DIR)/injected.css

.PHONY: compile-firefox
compile-firefox: $(FIREFOX_TARGETS)

$(BIN_DIR)/fiveui.js: $(call dir-dep,$(BIN_DIR)) $(js_sources)
	$(call rm-on-failure,$(compile-js) \
	    $(foreach ns,$(js_lib_namespaces), --namespace=$(ns)) > $@)
	echo 'exports.fiveui = fiveui;' >> $@

$(BIN_DIR)/firefox-main.js: $(call dir-dep,$(BIN_DIR)) $(js_sources)
	$(call rm-on-failure,$(compile-js) --namespace=fiveui.firefox.main > $@)


# TODO: remove 2 lines below, duplicate of above?
# compile with the closure compiler instead of the script output mode
#	$(call rm-on-failure,$(closure-js) --namespace=fiveui.firefox.main > $@)

# Build the compiled options script.
$(BIN_DIR)/firefox-options.js: $(call dir-dep,$(BIN_DIR)) $(js_sources)
	$(call rm-on-failure,$(compile-js) \
		--namespace=fiveui.firefox.options.init > $@)

# Use the cfx command to debug a firefox extension.
.PHONY: run-firefox
run-firefox: $(FIREFOX_TARGETS)
	@echo Running Firefox extension...
	$(call cfx,run -p $(REPO_ROOT)/profiles/firefox)

# Use the cfx command to debug a firefox extension.
.PHONY: test-firefox
test-firefox: $(FIREFOX_TARGETS) $(BIN_DIR)/fiveui.js
	@echo Testing Firefox extension...
	$(call cfx,test -v -p $(REPO_ROOT)/profiles/firefox)

# Clean firefox extension build artifacts.
.PHONY: clean-firefox
clean-firefox:
	@echo Cleaning Firefox extension...
	rm -rf profile

clean: clean-firefox


# Package Staging ##############################################################

STAGE_DIR := $(BUILD_ROOT)/stage

$(eval $(call dir-exists,$(STAGE_DIR)))

define copy-dir
mkdir -p $(STAGE_DIR)/$(dir $1)
cp -r $(BUILD_ROOT)/$1 $(STAGE_DIR)/$(dir $1)
endef

PACKAGE_SPECS := $(addprefix $(BUILD_ROOT)/,manifest.json package.json)

.PHONY: stage
stage: $(call dir-dep,$(STAGE_DIR)) compile $(PACKAGE_SPECS)
	$(call copy-dir,data/target)
	$(call copy-dir,data/fiveui)
	$(call copy-dir,data/lib)
	cp $(PACKAGE_SPECS) $(STAGE_DIR)

.PHONY: clean-stage
clean-stage:
	$(RM) -r $(STAGE_DIR)
clean: clean-stage


# CRX Generation ###############################################################

MAKE_CRX := $(BUILD_DIR)/makecrx

$(BUILD_ROOT)/fiveui.crx: stage
	$(MAKE_CRX) $(STAGE_DIR) $(CHROME_DIR)/fiveui.pem fiveui

.PHONY: clean-crx
clean-crx:
	$(RM) $(BUILD_ROOT)/fiveui.crx
clean: clean-crx

.PHONY: package-chrome
package-chrome: $(BUILD_ROOT)/fiveui.crx
package: package-chrome


# XPI Generation ###############################################################

$(BUILD_ROOT)/fiveui.xpi: stage
	$(call cfx,xpi \
		-p $(REPO_ROOT)/profiles/firefox \
		--pkgdir=$(STAGE_DIR))

.PHONY: run-firefox-staged
run-firefox-staged: stage
	$(call cfx,run -p $(REPO_ROOT)/profiles/firefox \
		--pkgdir=$(STAGE_DIR))

.PHONY: clean-xpi
clean-xpi:
	$(RM) $(BUILD_ROOT)/fiveui.xpi
clean: clean-xpi

.PHONY: package-firefox
package-firefox: $(BUILD_ROOT)/fiveui.xpi ;
package: package-firefox

# Installation #################################################################

install:
	$(MV) $(BUILD_ROOT)/fiveui.{crx,xpi} $(INSTALL_DIR)
