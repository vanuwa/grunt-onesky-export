/*
 *
 * Copyright (c) 2016 Va Nuwa
 * Licensed under the MIT license.
 */
var extend = require('extend');

module.exports = function (grunt) {
  grunt.registerMultiTask('mergeTranslations',
    'Extend translation keys for validation messages and add to original translation file', function () {
      var options = this.options({
        originalTranslationPath: '',
        translationForValidationPath: '',
        /**
         * warn - show warning on fail and continue execution
         * error - show error and break execution
         * */
        failMode: 'error'
      });

      var
        translationForValidation = readJSON(options.translationForValidationPath),
        originalTranslation = readJSON(options.originalTranslationPath);

      if (translationForValidation && originalTranslation) {
        extend(true, translationForValidation, originalTranslation.validation);

        originalTranslation.validation = translationForValidation;

        grunt.file.write(options.originalTranslationPath, JSON.stringify(originalTranslation));
      } else {
        fail('Uknown error:\n' + translationForValidation + '\n' + originalTranslation);
      }
    });

  function readJSON (path) {
    if (grunt.file.exists(path)) {
      return grunt.file.readJSON(path);
    } else {
      grunt.log.writeln(('File doesn\'t exists: ' + path).yeallow);
    }
  }

  function fail () {
    if (options.failMode === 'warn') {
      grunt.log.writeln(("Warning: " + arguments[0]).yellow);
    } else {
      grunt.fail.warn(arguments[0]);
    }
  }
};