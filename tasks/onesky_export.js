/*
 * grunt-onesky-export
 * https://github.com/howardhenry/grunt-onesky-export
 *
 * Copyright (c) 2015 Howard Henry
 * Licensed under the MIT license.
 */

'use strict';

var crypto = require('crypto');
var _ = require('lodash');
var request = require('request');
var sortObject = require('deep-sort-object');

var apiRoot = 'https://platform.api.onesky.io/1/';

module.exports = function (grunt) {
    grunt.registerMultiTask('oneskyExport', 'Export translations from OneSky', function () {

        var done = this.async();

        // TODO: Add isReady options (only download if translation is ready to be published)
        var options = this.options({
            authFile: 'onesky.json',
            dest: '/',
            projectId: '',
            sourceFile: '',
            output: '',
            sortKeys: false,
            indent: 4,
            exportType: 'multilingual',
            /**
             * warn - show warning on fail and continue execution
             * error - show error and break execution
             * */
            failMode: 'error',

            // Required only for exporting translations in separate language files
            locale: ''
        });

        return fetchTranslations();

        ///////////////////////////


        function fetchTranslations() {
            var api = getApi();
            var url = api.baseUrl + api.path;
            var requestOptions;
            var queryParams = { 'source_file_name': options.sourceFile };

            if (options.exportType === 'multilingual') {
                url = url + 'translations/multilingual';
                queryParams = _.extend(queryParams, { 'file_format': 'I18NEXT_MULTILINGUAL_JSON' });
            }

            if (options.exportType === 'locale') {
                url = url + 'translations';
                queryParams = _.extend(queryParams, { 'locale': options.locale });
            }

            requestOptions = {
                method: 'GET',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                qs: {
                    'api_key': api.publicKey,
                    'timestamp': api.timestamp,
                    'dev_hash': api.devHash
                }
            };

            requestOptions.qs = _.extend(requestOptions.qs, queryParams);

            return request(requestOptions, onFetchTranslations);
        }


        function onFetchTranslations(error, response, body) {
            var contentType = 'application/json';

            if (!error) {
                if (response.statusCode === 200) {

                    if (_.has(response, 'headers.content-type')) {
                        contentType = response['headers']['content-type'];
                    }
                    onFetchTranslationSuccess(body, contentType);
                } else {
                    onFetchTranslationError(response);
                }
            } else {
                fail('Request error: ' + error);
            }

            done();
        }


        function onFetchTranslationSuccess(data, contentType) {
            var fileName;
            var fileData = data;

            if (contentType === 'application/json') {
                data = JSON.parse(data);

                if (options.sortKeys) { data = sortObject(data); }
                fileData = JSON.stringify(data, null, options.indent) + '\n';
            }

            if (options.exportType === 'multilingual') {
                fileName = options.output || options.sourceFile;
                grunt.file.write(options.dest + fileName, fileData);
            }

            if (options.exportType === 'locale') {
                fileName = options.output || options.locale + '_' + options.sourceFile;
                grunt.file.write(options.dest + fileName, fileData);
            }

            grunt.log.ok('Translation Downloaded: ' + options.dest + fileName);
        }


        function onFetchTranslationError(error) {
            switch (error.statusCode) {
                case 400:
                    fail('Invalid source file: ' + options.sourceFile);
                    break;
                case 401:
                    fail('Unauthorized - Invalid OneSky API keys / project ID');
                    break;
                default:
                    unhanledErrorNotification(error);
                    break;
            }
        }

        function unhanledErrorNotification (error) {
            error = JSON.parse(error);
            var errorMsg;
            var statusCode;

            if (_.has(error, 'meta.status')) {
                statusCode = error.meta.status;
            }

            if (_.has(error, 'meta.message')) {
                errorMsg = error.meta.message;
            }

            fail(statusCode + ': ' + errorMsg);
        }


        function getApi() {
            var oneSkyKeys = grunt.file.readJSON(options.authFile);

            var timestamp = Math.floor(Date.now() / 1000);
            var devHash = crypto.createHash('md5').update(timestamp + oneSkyKeys.secretKey).digest('hex');

            return {
                baseUrl: apiRoot,
                path: 'projects/' + options.projectId + '/',
                publicKey: oneSkyKeys.publicKey,
                timestamp: timestamp,
                devHash: devHash
            };
        }

        function fail () {
            if (options.failMode === 'warn') {
                grunt.log.writeln(("Warning: " + arguments[0]).yellow);
            } else {
                grunt.fail.warn(arguments[0]);
            }
        }
    });
};
