
# Firefox Extension ############################################################

all: $(build-dir)/firefox.xpi

firefox-dir := $(path)

firefox-build := $(build-dir)/firefox

$(firefox-build): | $(build-dir)
	$(call cmd,mkdir)


# Generic Extension ############################################################

$(eval $(call stage-fiveui,$(firefox-build),stage-firefox))


# Firefox File Staging #########################################################

# copy in firefox scripts
$(firefox-build)/data/js/%: $(firefox-dir)/js/% | $(firefox-build)/data/js
	$(call cmd,cp)

# copy in firefox scripts
$(firefox-build)/data/injected/%: $(firefox-dir)/injected/% \
                                | $(firefox-build)/data/injected
	$(call cmd,cp)

$(firefox-build)/data/icons/%: $(firefox-dir)/icons/% \
                             | $(firefox-build)/data/icons
	$(call cmd,cp)

$(firefox-build)/data/icons: | $(firefox-build)/data
	$(call cmd,mkdir)

$(firefox-build)/data/%: $(firefox-dir)/lib/% | $(firefox-build)/data
	$(call cmd,cp)


$(firefox-build)/%: $(firefox-dir)/% | $(firefox-build)
	$(call cmd,cp)


# Wrapper Compilation ##########################################################

# In order to turn a number of different javascript modules into a single one,
# we just concatenate them all together.  This should be fine, as all of the
# modules we define just provide functions, or register callbacks.
quiet_cmd_compilejs = JSC        $(call drop-prefix,$@)
      cmd_compilejs = cat $^ > $@

# we have to build one big source for the firefox main.js, as we can't really
# share reuse the CommonJS module system in the chrome version.
$(firefox-build)/data/main.js:     \
    $(firefox-dir)/lib/main.js     \
    $(fiveui-dir)/js/set.js        \
    $(fiveui-dir)/js/url-pat.js    \
    $(fiveui-dir)/js/url-pat.js    \
    $(fiveui-dir)/js/settings.js   \
    $(fiveui-dir)/js/messenger.js  \
    $(fiveui-dir)/js/state.js      \
    $(fiveui-dir)/js/utils.js      \
    $(fiveui-dir)/js/rules.js      \
    $(fiveui-dir)/js/background.js \
  | $(firefox-build)/data
	$(call cmd,compilejs)


# Packaging ####################################################################

addon-sdk := $(topdir)/tools/addon-sdk

# wrapper for setting up the environment for the running the cfx command
cfx = ( cd $(addon-sdk) $(redir) && \
        . bin/activate  $(redir) && \
        cd $1           $(redir) && \
        cfx $2          $(redir) )

.PHONY: stage-firefox
stage-firefox:                                    \
    $(firefox-build)/package.json                 \
    $(firefox-build)/data/main.js                 \
    $(firefox-build)/data/ajax.js                 \
    $(firefox-build)/data/storage-wrapper.js      \
    $(firefox-build)/data/tabIds.js               \
    $(firefox-build)/data/icons/fiveui-icon.html  \
    $(firefox-build)/data/icons/fiveui-icon.js    \
    $(firefox-build)/data/icons/options-icon.html \
    $(firefox-build)/data/icons/options-icon.js   \
  | $(firefox-build)

$(build-dir)/firefox.xpi: stage-firefox
	$(call label,XPI        $(call drop-prefix,$@))\
	  $(call cfx,$(build-dir),xpi -p $(topdir)/profiles/firefox \
	                 --pkgdir=$(firefox-build) )


# Testing ######################################################################

run-firefox: stage-firefox
	$(call label,RUNFF)$(call cfx,$(firefox-build),run)
