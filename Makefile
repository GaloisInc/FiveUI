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

.PHONY: package
package:

.PHONY: unpack
unpack:

.PHONY: clean
clean::

.PHONY: distclean
distclean:: clean

.PHONY: test
test:


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

$(eval $(call subdir,tools))

$(eval $(call subdir,src/js/fiveui))
$(eval $(call subdir,src/js/chrome))
$(eval $(call subdir,src/js/firefox))
$(eval $(call subdir,src/js/tests))

$(eval $(call subdir,src/batchtools))

$(eval $(call subdir,profiles))
$(eval $(call subdir,doc))


# Package Deployment ###########################################################

ifeq "$(git-cmd)" ""
$(call strict-error,"unable to locate git")
else

remote-url := $(shell $(git-cmd) config remote.origin.url)

$(build-dir)/gh-pages: | $(build-dir)
	$(call label,CLONE      $(call drop-prefix,$@))\
	  (  $(git-cmd) clone $(if $(Q),-q) $(topdir) $@ \
	  && cd $@ \
	  && $(git-cmd) remote set-url origin $(remote-url) \
	  && $(git-cmd) fetch $(if $(Q),-q) origin \
	  && $(git-cmd) checkout $(if $(Q),-q) gh-pages )

$(build-dir)/gh-pages/binaries/%: $(build-dir)/% \
                                | $(build-dir)/gh-pages
	$(call cmd,cp)

.PHONY: genereate
generate: $(build-dir)/gh-pages/binaries/fiveui.xpi \
          $(build-dir)/gh-pages/binaries/fiveui.crx
	$(call label,GENERATE)\
	  (  cd $(build-dir)/gh-pages \
	  && $(git-cmd) pull $(if $(Q),-q) \
	  && $(git-cmd) add binaries \
	  && $(git-cmd) add -u binaries \
	  && $(git-cmd) commit $(if $(Q),-q) -m "deploy extensions" )

.PHONY: deploy
deploy: generate
	$(call label,DEPLOY)\
	  (  cd $(build-dir)/gh-pages \
	  && git push $(if $(Q),-q) origin gh-pages )

endif
