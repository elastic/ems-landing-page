const UglifyJS = require('uglify-js');
const exec = require('child_process').exec;

module.exports = function (grunt) {


  const BUILD_DIR = './build/';
  const COMPILED_FILE = './public/main.bundle.js';
  const COMPILED_FILE_SOURCE_MAP = './public/main.bundle.js.map';
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
      compile: [COMPILED_FILE, COMPILED_FILE_SOURCE_MAP]
    },
    copy: {
      'site-html': {
        files: [
          { expand: true, cwd: './public', src: 'index.html', dest: RELEASE_DIR_SITE },
        ]
      },
      'site-js': {
        src: COMPILED_FILE,
        dest: RELEASE_DIR_SITE + 'main.bundle.js',
        options: {
          process: function (content) {
            const minified = UglifyJS.minify(content, { mangle: false, compress: false });
            if (minified.error) {
              throw new Error(minified.error);
            }
            if (minified.warnings) {
              console.warn(minified.warnings);
            }
            return minified.code;
          }
        }
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

  grunt.registerTask('build-unsafe', ['clean:release', 'clean:compile', 'eslint', 'run:compile', 'copy:site-html', 'copy:site-js']);
  grunt.registerTask('default', ['git-check-clean-dir', 'build-unsafe']);

  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
};
