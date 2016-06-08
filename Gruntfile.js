module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-react');


  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      jsx: {
        files: ['static/react/jsx/**/*.jsx'],
        tasks: ['reactify']
      }
    },
    babel: {
      options: {
          presets: ['es2015']
      },
      natural: {
          files: {
              'static/react/compiled/natural.js': 'static/react/es6/natural.js'
          }
      }
    },
    react: {
      natural: {
        src: 'static/react/jsx/natural.jsx',
        dest: 'static/react/es6/natural.js'
      }
    },
    webpack: {
      natural:{

        entry: [
          './node_modules/react/dist/react.js',
          './node_modules/react-dom/dist/react-dom.js',
          './static/react/compiled/natural.js' // Your appʼs entry point
        ],
        output: {
          path: 'static/react/compiled',
          filename: 'natural.bundle.js'
        }
      }
    }
  });

  grunt.registerTask('reactify', [
    'react',
    'babel',
    'webpack'
  ]);


  grunt.registerTask('default', ['watch:jsx']);

};
