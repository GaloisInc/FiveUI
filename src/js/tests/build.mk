
js-test-dir := $(path)

clean::
	$(RM) -r $(js-test-dir)/reports


# Jasmine Specs ###############################################################

ifeq "$(phantomjs-cmd)" ""
$(call strict-error,"phantomjs not found: unable to run javascript tests")
else

test: test-js
test-js:
	cd $(topdir)/src/js && $(phantomjs-cmd)                  \
	  lib/phantomjs_jasmine/phantomjs_jasminexml_runner.js \
	  tests/PhantomJSJasmineRunner.html tests/reports/

endif
