
# gh-pages Branch Management ###################################################

gh-pages-dir := $(build-dir)/gh-pages

ifeq "$(git-cmd)" ""
$(call strict-error,"unable to locate git")
else

# figure out the url of the origin that the current work repo uses
remote-url := $(shell $(git-cmd) config remote.origin.url)

endif


# Pull in the gh-pages directory.
.PHONY: pull-gh-pages
ifeq "$(pull)" "0"
pull-gh-pages:
else
pull-gh-pages: | $(gh-pages-dir)
	$(call label,PULL       $(call drop-prefix,$(gh-pages-dir)))\
	  (  cd $(gh-pages-dir) \
	  && $(git-cmd) pull $(if $(Q),-q) )
endif


# checkout the gh-pages branch in a temp repo under the build tree
$(gh-pages-dir): | $(build-dir)
	$(call label,CLONE      $(call drop-prefix,$@))\
	  (  $(git-cmd) clone $(if $(Q),-q) $(topdir) $@ \
	  && cd $(gh-pages-dir) \
	  && $(git-cmd) remote set-url origin $(remote-url) \
	  && $(git-cmd) fetch $(if $(Q),-q) origin gh-pages \
	  && $(git-cmd) checkout $(if $(Q),-q) gh-pages )


# Generate a commit in the gh-pages-dir, after adding some files that may have
# changed.
commit = $(call label,COMMIT     $(call drop-prefix,$(gh-pages-dir)))\
	  (  cd $(gh-pages-dir) \
	  && if test -n "`$(git-cmd) status -s`"; then \
	        $(git-cmd) add $1 \
	     && $(git-cmd) commit $(if $(Q),-q) -m $2 \
	     ; fi )



# push to the gh-pages branch from the temp repo
deploy: | pull-gh-pages
	$(call label,DEPLOY)\
	  (  cd $(gh-pages-dir) \
	  && git push $(if $(Q),-q) origin gh-pages )
