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
    Code to run when document is ready
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -    */

$(document).ready(function() {
    $(document).foundation();
});
