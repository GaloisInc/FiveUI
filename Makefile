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

.PHONY: generate
generate:

.PHONY: deploy
deploy:


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

gh-pages-dir := $(build-dir)/gh-pages

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


# GH-Pages Generation ##########################################################

ifeq "$(git-cmd)" ""
$(call strict-error,"unable to locate git")
endif

remote-url := $(shell $(git-cmd) config remote.origin.url)

$(gh-pages-dir): | $(build-dir)
	$(call label,CLONE      $(call drop-prefix,$@))\
	  (  $(git-cmd) clone $(if $(Q),-q) $(topdir) $@ \
	  && cd $(gh-pages-dir) \
	  && $(git-cmd) remote set-url origin $(remote-url) \
	  && $(git-cmd) fetch $(if $(Q),-q) origin gh-pages \
	  && $(git-cmd) checkout $(if $(Q),-q) gh-pages )


generate: pull-gh-pages

.PHONY: pull-gh-pages
ifeq "$(pull)" "0"
pull-gh-pages:
else
pull-gh-pages: $(gh-pages-dir)
	$(call label,PULL       $(call drop-prefix,$(gh-pages-dir)))\
	  (  cd $(gh-pages-dir) \
	  && $(git-cmd) pull $(if $(Q),-q) )
endif


# Move extensions into the binaries directory of the gh-pages branch
$(gh-pages-dir)/binaries/%: $(build-dir)/% pull-gh-pages
	$(call cmd,cp)

generate: $(build-dir)/gh-pages/binaries/fiveui.xpi
generate: $(build-dir)/gh-pages/binaries/fiveui.crx


# GH-Pages Deployment ##########################################################

# this should be the only implementation of deploy.
deploy: generate
	$(call label,DEPLOY)\
	  (  cd $(gh-pages-dir) \
	  && $(git-cmd) commit $(if $(Q),-q) -m "deploy gh-pages" \
	  && $(git-cmd) add    \
	  && $(git-cmd) add -u \
	  && git push $(if $(Q),-q) origin gh-pages )
