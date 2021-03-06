
batchtools-dir := $(path)

ifeq "$(maven-cmd)" ""
$(call strict-error,"No maven found: unable to run batchtools tests")
else

test: test-batchtools

.PHONY: test-batchtools
test-batchtools:            \
  $(build-dir)/fiveui.xpi   \
  $(topdir)/profiles/firefox
	$(call label,BATCHTEST)(cd $(batchtools-dir) \
	  && xvfb-run -a $(maven-cmd) test -DFIREFOX_BIN_PATH=$(firefox_bin_path))

clean::
	(cd $(batchtools-dir) && $(maven-cmd) clean)

endif
