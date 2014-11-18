
# ?= means you can override these, e.g.
# CFXFLAGS="--no-run" make run
CFXFLAGS   ?=
PROFILEDIR ?= ${HOME}/.mozilla/firefox/cfx
BINARY     ?= ${HOME}/.local/bin/firefox
CFX        ?= $(shell which cfx)
DEBUG      ?= 1
PKGDIR     ?= $(realpath .)
SCRIPTS    ?= "$(PKGDIR)/scripts"

run:
		DEBUG=$(DEBUG) \
		BUBBLE_USERSCRIPT_DIRECTORY=$(SCRIPTS) \
	$(CFX) \
		$(CFXFLAGS) \
		--overload-modules \
		--binary=$(BINARY) \
		--profiledir=$(PROFILEDIR) \
	run

test:
	$(CFX) $(CFXFLAGS) test

xpi:
	$(CFX) xpi

all: xpi

.PHONY: run test
