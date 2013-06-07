
js-test-dir := $(path)

clean::
	$(RM) -r $(js-test-dir)/reports


# Jasmine Specs ###############################################################

ifneq "$(PHANTOM_EXE)" ""

test: test-js
test-js:
	cd $(topdir)/src/js && $(PHANTOM_EXE)                  \
	  lib/phantomjs_jasmine/phantomjs_jasminexml_runner.js \
	  tests/PhantomJSJasmineRunner.html tests/reports/

endif
