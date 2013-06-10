
batchtools-dir := $(path)

ifeq "$(maven-cmd)" ""
$(call strict-error,"No maven found: unable to run batchtools tests")
else

test: test-batchtools

.PHONY: test-batchtools
test-batchtools: $(topdir)/profiles/chrome $(topdir)/profiles/firefox
	$(call label,BATCHTEST)(cd $(batchtools-dir) \
	  && xvfb-run -a $(maven-cmd) test)

clean::
	(cd $(batchtools-dir) && $(maven-exe) clean)

endif
