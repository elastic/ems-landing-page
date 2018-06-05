module.exports = function (grunt) {


  const BUILD_DIR = './build/';
  const COMPILE_DIR = './public/dist/';
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
      compile: [COMPILE_DIR]
    },
    copy: {
      site: {
        files: [
          { expand: true, cwd: './public', src: 'index.html', dest: RELEASE_DIR_SITE },
          { expand: true, cwd: './public', src: 'style/**', dest: RELEASE_DIR_SITE },
          { expand: true, cwd: './public', src: 'dist/**', dest: RELEASE_DIR_SITE }
        ]
      }
    },

    compress: {
      release: {
        options: {
          archive: function () {
            return BUILD_DIR + 'release.zip';
          }
        },
        files: [
          { cwd: RELEASE_DIR_SITE, src: ['**'], dest: '.', filter: 'isFile', expand: true }
        ]
      }
    }
  });

  grunt.registerTask('default', ['clean:release', 'clean:compile', 'eslint', 'run:compile', 'copy:site', 'compress:release']);
git
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');

};
