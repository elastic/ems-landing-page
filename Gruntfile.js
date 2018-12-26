const exec = require('child_process').exec;

module.exports = function (grunt) {

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

  grunt.registerTask('build-unsafe', ['eslint', 'run:compile']);
  grunt.registerTask('default', ['git-check-clean-dir', 'build-unsafe']);

  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-eslint');
};
