const exec = require('child_process').exec;

module.exports = function (grunt) {


  const BUILD_DIR = './build/';
  const COMPILED_FILES = './public/*.bundle.js';
  const COMPILED_FILES_SOURCE_MAP = './public/*.bundle.js.map';
  const RELEASE_DIR_SITE = BUILD_DIR + 'release/';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      target: ['./public/js'],
      options: {
        quiet: true
      }
    },
    run: {
      options: {},
      compile: {
        cmd: 'yarn',
        args: ['compile']
      }
    },
    clean: {
      release: [BUILD_DIR],
      compile: [COMPILED_FILES, COMPILED_FILES_SOURCE_MAP]
    },
    copy: {
      'site-html-png': {
        files: [
          { expand: true, cwd: './public', src: 'index.html', dest: RELEASE_DIR_SITE },
          { expand: true, cwd: './public', src: 'ems.png', dest: RELEASE_DIR_SITE },
        ]
      },
      'site-js': {
        expand: true, 
        flatten: true,
        src: [COMPILED_FILES, COMPILED_FILES_SOURCE_MAP], 
        dest: RELEASE_DIR_SITE
      }
    }
  });


  grunt.registerTask('git-check-clean-dir', function ()  {
    const done = this.async();
    exec('git status --porcelain', (err, stdout, sterr) => {
      if (err || sterr) {
        throw new Error(err);
      }
      if (stdout.length > 0) {
        const error = `Git working directory not clean: ${stdout}`;
        console.error(error);
        throw new Error(error);
      } else {
        done();
      }
    });
  });

  grunt.registerTask('build-unsafe', ['clean:release', 'clean:compile', 'eslint', 'run:compile', 'copy:site-html-png', 'copy:site-js']);
  grunt.registerTask('default', ['git-check-clean-dir', 'build-unsafe']);

  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
};
