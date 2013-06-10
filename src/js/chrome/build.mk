

# Chrome Extension #############################################################

all: stage-chrome

package: $(build-dir)/fiveui.crx

chrome-dir := $(path)

chrome-build := $(build-dir)/chrome


# Generic Extension Parts ######################################################

# pull in the base fiveui extension
$(eval $(call stage-fiveui,$(chrome-build),stage-chrome))


# Chrome File Staging ##########################################################

# copy over scripts from the chrome extension
$(chrome-build)/data/js/%: $(chrome-dir)/js/% | $(chrome-build)/data/js
	$(call cmd,cp)

$(chrome-build)/data/injected/%: $(chrome-dir)/injected/% | $(chrome-build)/data/injected
	$(call cmd,cp)

$(chrome-build)/data/%: $(chrome-dir)/% | $(chrome-build)/data
	$(call cmd,cp)

$(chrome-build)/%: $(chrome-dir)/% | $(chrome-build)
	$(call cmd,cp)

$(chrome-build): | $(build-dir)
	$(call cmd,mkdir)


# Packaging ####################################################################

.PHONY: stage-chrome
stage-chrome: $(chrome-build)/manifest.json                  \
              $(chrome-build)/data/background.html           \
              $(chrome-build)/data/js/platform-port.js       \
              $(chrome-build)/data/js/platform-background.js \
            | $(chrome-build)

# generate the executable after copying over all files
$(build-dir)/fiveui.crx: stage-chrome
	$(call label,MAKECRX    $(call drop-prefix,$@)) ( cd $(build-dir) \
	&& $(topdir)/tools/bin/makecrx $(chrome-build)                    \
	     $(topdir)/fiveui.pem fiveui                                  \
	     $(redir) )
