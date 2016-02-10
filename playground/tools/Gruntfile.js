module.exports = function (grunt) {
    grunt.file.setBase('../');

    grunt.initConfig({
        oneskyExport: {
            default: {
                options: {
                    authFile: "locale/onesky.json",
                    dest: 'locale/tmp/',
                    projectId: '13823',
                    sourceFile: 'translation.json',
                    output: 'translation_output.json',
                    exportType: 'locale',
                    locale: 'en',
                    failMode: 'warn'
                }
            }
        }

    });

    grunt.loadTasks('../tasks');

    grunt.registerTask('default', ['oneskyExport']);

};
