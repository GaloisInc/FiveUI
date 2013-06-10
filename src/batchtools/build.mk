
mvn-exe        := $(shell which mvn 2>/dev/null)
batchtools-dir := $(path)

ifeq "$(mvn-exe)" ""
$(call strict-error,"No maven found, unable to run batchtools tests")
else

test: test-batchtools

.PHONY: test-batchtools
test-batchtools: $(topdir)/profiles/chrome $(topdir)/profiles/firefox
	$(call label,BATCHTEST)(cd $(batchtools-dir) \
	  && xvfb-run -a $(mvn-cmd) test)

clean::
	(cd $(batchtools-dir) && $(mvn-exe) clean)

endif
