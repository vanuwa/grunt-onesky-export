module.exports = function (grunt) {
    grunt.file.setBase('../../');

    grunt.initConfig({
        project: {
            onesky: {
                rootPath: 'playground/locale/',
                translation: {
                    projectId: '13823',
                    output: 'translation.json'
                },
                translationForValidation: {
                    projectId: '52900',
                    output: 'validation.json'
                }
            }
        },
        oneskyExport: {
            options: {
                authFile: '<%= project.onesky.rootPath %>onesky.json',
                exportType: 'locale',
                projectId: '<%= project.onesky.translation.projectId %>',
                sourceFile: 'translation.json',
                output: '<%= project.onesky.translation.output %>',
                requestTimeout: 15000,
                failMode: 'warn'
            },
            en: {
                options: {
                    locale: 'en',
                    dest: '<%= project.onesky.rootPath %>en/'
                }
            },
            validation_en: {
                options: {
                    locale: 'en',
                    dest: '<%= project.onesky.rootPath %>en/',
                    projectId: '<%= project.onesky.translationForValidation.projectId %>',
                    output: '<%= project.onesky.translationForValidation.output %>'
                }
            },
            de: {
                options: {
                    locale: 'de',
                    dest: '<%= project.onesky.rootPath %>de/'
                }
            },
            validation_de: {
                options: {
                    locale: 'de',
                    dest: '<%= project.onesky.rootPath %>de/',
                    projectId: '<%= project.onesky.translationForValidation.projectId %>',
                    output: '<%= project.onesky.translationForValidation.output %>'
                }
            }
        },
        mergeTranslations: {
            options: {
                failMode: 'warn'
            },
            de: {
                options: {
                    originalTranslationPath: '<%= oneskyExport.de.options.dest %><%= oneskyExport.options.output %>',
                    translationForValidationPath: '<%= oneskyExport.validation_de.options.dest %><%= oneskyExport.validation_de.options.output %>'
                }
            },
            en: {
                options: {
                    originalTranslationPath: '<%= oneskyExport.en.options.dest %><%= oneskyExport.options.output %>',
                    translationForValidationPath: '<%= oneskyExport.validation_en.options.dest %><%= oneskyExport.validation_en.options.output %>'
                }
            }
        },
        'json-pretty': {
            options: {
                src: [ 'playground/locale/' ],
                files: '*',
                indent: 2,
                cleanup: true
            }
        }

    });

    grunt.loadNpmTasks('grunt-json-pretty');

    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['oneskyExport']);
    grunt.registerTask('translations', [ 'oneskyExport', 'mergeTranslations', 'json-pretty' ]);

};
