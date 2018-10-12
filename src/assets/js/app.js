/*  -------------------------------------------------------------
    Nasqueron infrastructure
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    Project:        Nasqueron
    Author:         Sébastien Santoro aka Dereckson
    Dependencies:   jQuery
    Filename:       app.js
    Licence:        CC-BY 4.0, MIT, BSD-2-Clause (multi-licensing)
    -------------------------------------------------------------    */

import $ from 'jquery';
window.$ = $;

import Foundation from 'foundation-sites';

/*  -------------------------------------------------------------
    Table of contents
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

 :: Servers log
 :: Code to run when document is ready

 */

var ServersLog = function (url, container) {
    var serversLog = {

        ///
        /// Private properties
        ///

        /**
         * A JQuery selector expression to a DOM element to publish the log in.
         *
         * @var string
         */
        container: "",

        /**
         * The URL to fetch the log.
         *
         * @var string
         */
        url: "",

        /**
         * The log entries fetched.
         *
         * @var array
         */
        logEntries: [],

        ///
        /// Constructor
        ///

        /**
         * Initializes an instance of this object.
         *
         * @param url The URL to the log
         * @param container The DOM element JQuery selector where to write
         */
        load: function (url, container) {
            this.url = url;
            this.container = container;
            this.refreshData();
        },

        ///
        /// Main methods
        ///

        /**
         * Fetches log entries. That will trigger an UI refresh once fetched.
         */
        refreshData: function () {
            this.fetchLogEntries();
        },

        /**
         * Refreshes the UI from the content in logEntries array.
         */
        refreshUI: function () {
            $(this.container).html(this.formatEntries());
        },

        ///
        /// Data helper methods
        ///

        /**
         * Fetches the log entries at the log URL, fills logEntries array,
         * refreshes the UI.
         */
        fetchLogEntries: function () {
            $.getJSON(this.url, function(data) {
                serversLog.logEntries = data.reverse(); // Log is chronological.
                serversLog.refreshUI();
            });
        },

        ///
        /// UI helper methods
        ///

        formatEntries: function () {
            var currentDate = "";
            var currentMonth = "";

            var entries = "";
            for (var i = 0; i < this.logEntries.length; i++) {
                var entry = this.logEntries[i];
                var date = this.getDate(entry.date);
                if (date != currentDate) {
                    // Month heading
                    var month = this.getMonth(entry.date);
                    if (month != currentMonth) {
                        entries += this.formatMonthHeadings(entry.date);
                        currentMonth = month;
                    }

                    // Day heading
                    entries += this.formatDateHeadings(date);
                    currentDate = date;
                }
                entries += this.formatEntry(entry);
            }
            return entries;
        },

        formatEntry: function (entry) {
            var format = `<p class="log-entry">
                <span class="log-component secondary label">%%component%%</span>
                <span class="log-time">%%date%%</span>
                <span class="log-emitter">%%emitter%%</span>:
                <span class="log-message">%%message%%</span>
            </p>`;
            return format
                .replace("%%component%%", entry.component)
                .replace("%%date%%", this.getTime(entry.date))
                .replace("%%emitter%%", entry.emitter)
                .replace("%%message%%", this.formatMessage(entry.entry))
                ;
        },

        ///
        /// Formats date headings
        ///

        /**
         * The month names.
         *
         * @var array
         */
        monthNames: [
            "January", "February", "March",
            "April", "May", "June",
            "July", "August", "September",
            "October", "November", "December"
        ],

        /**
         ** Gets a day headings element.
         *
         * @param date The date to print
         * @returns {string} The day heading
         */
        formatDateHeadings: function (date) {
            return '<h3>' + date + '</h3>';
        },

        /**
         * Gets a month heading element.
         *
         * @param timestamp The date to parse
         * @returns {string} The month heading
         */
        formatMonthHeadings: function (timestamp) {
            var date = new Date(timestamp);
            var month = this.monthNames[date.getUTCMonth()];

            return "<h2>" + month + "</h2>";
        },

        ///
        /// Format messages helper functions
        ///

        /**
         * @var array
         */
        messageDecorators: [
            {
                // SHA-1 Git commit hashes
                re: /\b([0-9a-f]{7,40})\b/g,

                /**
                 * Callback method to linkify when needed a SHA-1 hash.
                 *
                 * @param match The expression matched by the regexp
                 * @param p1 The SHA-1 hash candidate
                 * @param offset The position p1 has been found
                 * @param string The full string p1 has been found
                 * @returns {string}
                 */
                replaceBy: function (match, p1, offset, string) {
                    if (!serversLog.isHash(p1)) {
                        return p1;
                    }

                    return '<a href="https://devcentral.nasqueron.org/search/?query=%1">%1</a>'
                        .replace(/%1/g, p1);
                },
            },
            {
                // Tasks, reviews and pastes
                re: /\b([TDP][0-9]{1,6}(\#[0-9]{1,10})?)\b/g,
                replaceBy: '<a href="https://devcentral.nasqueron.org/$1">$1</a>',
            },
            {
                // Repositories callsigns
                re: /\br([A-Z]{3,32})\b/g,
                replaceBy: '<a rel="repository" href="https://devcentral.nasqueron.org/diffusion/$1/">r$1</a>',
            },
            {
                // Commits with callsigns
                re: /\br([A-Z]{3,32}[0-9a-f]{7,40})\b/g,
                replaceBy: '<a rel="commit" href="https://devcentral.nasqueron.org/r$1">r$1</a>',
            },
            {
                // Code (or SQL query parameter)
                re: /`(.*?)`/g,
                replaceBy: '<code>$1</code>'
            }
        ],

        /**
         * Whitelist of known hexadecimal words.
         *
         * @var array
         */
        hexadecimalKnownWord: [
            "added",
            "accede",
            "adead",
            "decade",
            "deedeed",
            "deface",
            "ed25519",
            "efface",
            "facade",
            "faced",
            "faded",
        ],

        /**
         * Determines if an expression matches a whitelisted hexadecimal word.
         *
         * @param word The word to check
         * @returns {boolean}
         */
        isHexadecimalKnownWord: function (word) {
            return this.hexadecimalKnownWord.indexOf(word) > -1;
        },

        /**
         * Determines if the specified expression is probably an hash.
         *
         * An hash is anything hexadecimal with at least one digit < 10
         * and one digit > 9 (A-F), not matching known vocabulary.
         *
         * @param hash
         * @returns {boolean}
         */
        isHash: function (hash) {
            if (this.isHexadecimalKnownWord(hash)) {
                return false;
            }

            if (/^\d+$/.test(hash) || /^[a-z]+$/i.test(hash)) {
                // Contains only letter or digits,
                // so not a good hash candidate.
                return false;
            }

            return true;
        },

        formatMessage: function (message) {
            for (var i = 0; i < this.messageDecorators.length; i++) {
                var decorator = this.messageDecorators[i];
                message = message.replace(decorator.re, decorator.replaceBy);
            }

            return message;
        },

        ///
        /// Date and time helper functions
        ///

        pad: function (number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        },

        getDate: function (timestamp) {
            var date = new Date(timestamp);
            return date.getUTCFullYear()
                + '-' + this.pad(date.getUTCMonth() + 1)
                + '-' + this.pad(date.getUTCDate());
        },

        getTime: function (timestamp) {
            var date = new Date(timestamp);
            return this.pad(date.getUTCHours())
                + ':' + this.pad(date.getUTCMinutes());
        },

        getMonth: function (timestamp) {
            var date = new Date(timestamp);
            return date.getUTCMonth();
        }

    }

    typeof container === 'string' && serversLog.load(url, container);

    return serversLog;
}


/*  -------------------------------------------------------------
    Code to run when document is ready
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -    */

$(document).ready(function() {
    $(document).foundation();

    new ServersLog("https://api.nasqueron.org/servers-log/all.json", "#log");
});
