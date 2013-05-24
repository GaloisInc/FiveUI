// Add any files here that need to be loaded before all tests are run.
//
// NOTE: Load order does matter.
// Load the envjasmine environment
EnvJasmine.loadGlobal(EnvJasmine.libDir + "envjs/env.rhino.1.2.js");
EnvJasmine.loadGlobal(EnvJasmine.libDir + "jasmine/jasmine.js");
EnvJasmine.loadGlobal(EnvJasmine.libDir + "jasmine-ajax/mock-ajax.js");
EnvJasmine.loadGlobal(EnvJasmine.libDir + "jasmine-ajax/spec-helper.js");
EnvJasmine.loadGlobal(EnvJasmine.libDir + "jasmine-jquery/jasmine-jquery-1.2.0.js");
EnvJasmine.loadGlobal(EnvJasmine.libDir + "jasmine-rhino-reporter/jasmine-rhino-reporter.js");

// Note:
// EnvJasmine.rootDir = $FIVEUI_ROOT/tools/EnvJasmine/
fiveuiDir = EnvJasmine.rootDir + "../../contexts/data/fiveui/";
fiveuiLibDir = EnvJasmine.rootDir + "../../contexts/data/lib/";
fiveuiTestsDir = EnvJasmine.rootDir + "../../contexts/data/tests/";

// Load FiveUI dependencies
//EnvJasmine.loadGlobal(fiveuiLibDir + "jasmine/jasmine.js");
//EnvJasmine.loadGlobal(fiveuiLibDir + "jasmine/jasmine-html.js");
//EnvJasmine.loadGlobal(fiveuiLibDir + "jasmine/boot.js");
EnvJasmine.loadGlobal(fiveuiLibDir + "jquery/jquery-1.8.3.js");
EnvJasmine.loadGlobal(fiveuiLibDir + "jquery/jquery.json-2.4.js");
EnvJasmine.loadGlobal(fiveuiLibDir + "underscore/underscore.js");
EnvJasmine.loadGlobal(fiveuiLibDir + "backbone/backbone.js");

// FiveUI + Jasmine deps
EnvJasmine.loadGlobal(fiveuiTestsDir + "mock-storage.js");

// Load all tested FiveUI js files
EnvJasmine.loadGlobal(fiveuiDir + "set.js");
EnvJasmine.loadGlobal(fiveuiDir + "utils.js");
EnvJasmine.loadGlobal(fiveuiDir + "chan.js");
EnvJasmine.loadGlobal(fiveuiDir + "rules.js");
EnvJasmine.loadGlobal(fiveuiDir + "messenger.js");
EnvJasmine.loadGlobal(fiveuiDir + "settings.js");
EnvJasmine.loadGlobal(fiveuiDir + "state.js");
EnvJasmine.loadGlobal(fiveuiDir + "injected/prelude.js");

// This is your main JavaScript directory in your project.
EnvJasmine.jsDir = EnvJasmine.rootDir + "../../contexts/data/fiveui/";

// this will include the code coverage plugin
//EnvJasmine.loadGlobal(EnvJasmine.libDir + "/jscover/envjasmine-sonar-coverage-properties.js"); // TODO: Uncomment and update if you want code coverage
//EnvJasmine.loadGlobal(EnvJasmine.coverage.envjasmine_coverage_js); // TODO: Uncomment if you want code coverage
