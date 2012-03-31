
# Entry Point ##################################################################

.PHONY: all
all: unpack

.PHONY: all
unpack:

.PHONY: clean
clean:


# Macros #######################################################################

define profile
.PHONY: $1
$1: $1/.token

$1/.token: $1.tar
	tar -xvf $$<
	touch $$@

unpack: $1

clean-$1:
	$(RM) -r $1
clean: clean-$1
endef


# Profile Management ###########################################################

$(eval $(call profile,chrome))
$(eval $(call profile,firefox))
