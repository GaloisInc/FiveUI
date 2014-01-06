/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      gruntfile: {
        jshintrc: true,
        src: 'Gruntfile.js'
      },
      src_specs: {
        jshintrc: true,
        src: ['src/**/*.js', 'test/**/*.js']
      }
    },
    jasmine: {
      guidelines: {
        src: 'src/**/*.js',
        options: {
          vendor: [
            '../../src/js/lib/underscore.js',
            '../../src/js/lib/jquery/jquery-1.8.3.js',
            '../../src/js/lib/md5.js',
            '../../src/js/fiveui/injected/prelude.js',
            '../../src/js/lib/injected/jquery-plugins.js',
            '../../src/js/lib/injected/compute.js'
          ],
          helpers: ['specs/exports.js', 'specs/*_helper.js'],
          specs: 'specs/*_spec.js',
          host: 'http://localhost:<%= connect.server.options.port %>/guidelines/wikipedia'
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 9867,
          base: '../..'
        }
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src_specs: {
        files: '<%= jshint.src_specs.src %>',
        tasks: ['jshint:src_specs', 'test']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'test']);

  grunt.registerTask('test', ['connect:server', 'jasmine:guidelines']);

};
