JSDOC_DIR=jsdoc
MANUAL_DIR=manual
MANUAL_SRC=manual_src
MAN_DEPS=$(MANUAL_SRC)/*.md $(MANUAL_SRC)/figures/*.png

jsdoc-toolkit=../build/jsdoc

jsdoc: ../contexts/data/fiveui/injected/prelude.js
	@$(jsdoc-toolkit) ../contexts/data/fiveui/injected/prelude.js

.PHONY: man
man: web-manual

$(MANUAL_DIR):
	@mkdir -p $(MANUAL_DIR)

.PHONY: web-manual
web-manual: $(MANUAL_DIR) $(MAN_DEPS)
	@make -C $(MANUAL_SRC)
	@cp -r $(MANUAL_SRC)/figures $(MANUAL_DIR)
	@cp -r $(MANUAL_SRC)/images $(MANUAL_DIR)
	@cp $(MANUAL_SRC)/*.html $(MANUAL_DIR)
	@cp $(MANUAL_SRC)/*.css $(MANUAL_DIR)
#	@mv $(MANUAL_SRC)/*.html $(MANUAL_DIR)

clean:
	@make -C $(MANUAL_SRC) clean
	@$(RM) -r $(JSDOC_DIR)
	@$(RM) -r $(MANUAL_DIR)
