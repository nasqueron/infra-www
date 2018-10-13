/*  -------------------------------------------------------------
    Nasqueron infrastructure
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    Project:        Nasqueron
    Author:         Sébastien Santoro aka Dereckson
    Dependencies:   jQuery
    Filename:       docker-registry.js
    Licence:        CC-BY 4.0, MIT, BSD-2-Clause (multi-licensing)
    -------------------------------------------------------------    */

/*  -------------------------------------------------------------
    Table of contents
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

 :: Docker registry API client
 :: Code to run when document is ready

 */

/*  -------------------------------------------------------------
    Docker registry API client

    Note: this code consumes our own private microservice in Rust
    https://devcentral.nasqueron.org/source/docker-registry-api/

    The Docker private registry also provides a REST API, but
    the client isn't compatible.
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -    */

let DockerRegistryClient  = function (url, container) {
    let dockerRegistryClient = {
        url: "",
        container: "",
        repositories: [],

        ///
        /// Constructor
        ///

        load: function (url, container) {
            this.url = url;
            this.container = container;

            $(container).text(`Querying ${this.url}…`);
            this.refreshData();
        },

        ///
        /// Main methods
        ///

        /**
         * Fetches log entries. That will trigger an UI refresh once fetched.
         */
        refreshData: function () {
            this.getAllRepositories();
        },

        refreshUI: function () {
            this.clearUI();
            for (let repository of this.repositories) {
                $(container).append(`<h3>${repository.name}</h3>`);
                for (let tag of repository.tags) {
                    $(container).append(`<p><strong>${tag.name}</strong> — ${tag.hash}</p>`);
                }
            }
        },

        clearUI: function () {
            $(container).text("");
        },

        ///
        /// API client methods
        ///

        getAllRepositories: function () {
            const url = this.url + "/repository/getAll";

            $.getJSON(url, function(repositories) {
                dockerRegistryClient.repositories = repositories;
                dockerRegistryClient.refreshUI();
            });
        }
    };

    typeof container === 'string' && dockerRegistryClient.load(url, container);

    return dockerRegistryClient;
};


/*  -------------------------------------------------------------
    Code to run when document is ready
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -    */

$(document).ready(function() {
    new DockerRegistryClient("https://api.nasqueron.org/docker/registry", "#registry");
});

