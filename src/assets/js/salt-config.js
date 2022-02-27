/*  -------------------------------------------------------------
    Nasqueron infrastructure
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    Project:        Nasqueron
    Author:         Sébastien Santoro aka Dereckson
    Dependencies:   jQuery
    Filename:       salt-config.js
    Licence:        CC-BY 4.0, MIT, BSD-2-Clause (multi-licensing)
    -------------------------------------------------------------    */

/*  -------------------------------------------------------------
    Table of contents
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

 :: Servers list
 :: States
 :: Code to run when document is ready

 */

const ServersConfig = function (container) {

    /*  -------------------------------------------------------------
        States
        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -    */

    const States = function (container, serverName, serverHost) {
        const states = {

            ///
            /// Constants
            ///

            SALT_BASE_URL: "https://devcentral.nasqueron.org/source/operations/browse/main/",
            SALT_STAGING_URL: "https://devcentral.nasqueron.org/source/staging/browse/master/",

            SALT_DOC_STATES_URL: "https://docs.saltproject.io/en/latest/ref/states/all/",

            ///
            /// Private properties
            ///

            /**
             * A JQuery selector expression to a DOM element to publish to.
             *
             * @var string
             */
            container: "",

            server: "",

            ///
            /// Constructor
            ///

            /**
             * Initializes an instance of this object.
             *
             * @param container The DOM element JQuery selector where to write
             * @param serverName The name of the server, to display it
             * @param serverHost The FQDN of the server, to fetch config data
             */
            load: function (container, serverName, serverHost) {
                this.container = container;
                this.server = serverName;
                this.refreshData(serverHost);
            },

            ///
            /// Main methods
            ///

            refreshData: function (serverHost) {
                let url = "https://" + serverHost + "/datasources/infra/all-states.json";
                $.getJSON(url, function (configurationStates) {
                    states.refreshUI(configurationStates);
                });
            },

            refreshUI: function (configurationStates) {
                $(this.container).html(this.formatConfig(configurationStates));

                $("#config-back-to-server-list").on("click", function () {
                    console.log("Back to servers list");
                    new ServersList(container)
                })
            },

            formatConfig: function (states) {
                return `
<button id="config-back-to-server-list" class="button extra-action">« Back to servers list</button>
<h2 class="config-server">${this.server}</h2>
${this.formatStates(states)}`
            },

            formatState: function (name, state) {
                let output = '<div class="state">'
                output += '<div class="state-name">' + name + "</div>"

                for (const [key, properties] of Object.entries(state)) {
                    if (key.startsWith("__")) {
                        continue
                    }
                    output += `<div class="state-module">
                        ${this.resolveSaltModuleMethod(key, properties)}
                    </div>`

                    output += '<div class="state-properties">'
                    for (const property of properties) {
                        if (typeof property === "string") {
                            // Method is already parsed by extractMethod
                            continue
                        }

                        if (property.order !== undefined) {
                            // We're lucky we already receive the states in the
                            // sorted order, so we can ignore this.
                            continue
                        }

                        output += this.dump(property)
                    }
                    output += "</div>"
                }

                output += "</div>"

                return output
            },

            formatStates: function (server_states) {
                let current_unit = ""
                let output = '<div class="states">'

                let roles_output = ""
                let roles = []

                for (const [role, role_states] of Object.entries(server_states)) {
                    roles.push(role)

                    roles_output += `<div class="config-role">
<h3 id="${this.makeId(role)}" class="config-role-title">${role}</h3>
<div class="config-role-content">`

                    if ($.isEmptyObject(role_states)) {
                        roles_output += '<p class="config-error">No information gathered for this role. There is probably an error in Salt configuration.</p>';
                    }

                    for (const [name, individual_state] of Object.entries(role_states)) {
                        // Gets unit from the state source SLS to generate units headings
                        let unit = individual_state["__sls__"].replace(role + ".", "")
                        if (unit !== current_unit) {
                            roles_output += `<h4 class="config-unit">${unit}</h4>`
                            current_unit = unit
                        }

                        roles_output += this.formatState(name, individual_state)
                    }

                    roles_output += "</div></div>";
                }

                roles_output += '</div>';

                output += `
<div class="config-summary-roles">
<h3 class="config-summary-roles-heading">Roles assigned</h3>
<ul class="config-summary-roles-list">
`
                for (const role of roles) {
                    output += `
<li class="config-summary-role">
    <a href="#${this.makeId(role)}">${role}</a>
</li>
                    `
                }
                output += "</ul></div>"

                output += roles_output;

                return output;
            },

            makeId: function (expression) {
                return expression.replace("/", ".")
            },

            resolveSaltModuleMethod: function (module, properties) {
                const method = this.extractMethod(properties);
                const link = `${this.SALT_DOC_STATES_URL}salt.states.${module}.html#salt.states.${module}.${method}`

                return `<a class="salt-link" href="${link}">${module}.${method}</a>`
            },

            extractMethod: function (properties) {
                for (const property of properties) {
                    if (typeof property === "string") {
                        return property
                    }
                }
            },

            isInStagingRepo: url => url.startsWith("salt://software/") || url.startsWith("salt://wwwroot/"),

            resolveSaltLink: function (url) {
                const base = this.isInStagingRepo(url)
                    ? this.SALT_STAGING_URL
                    : this.SALT_BASE_URL

                const link = base + url.replace("salt://", "")
                return `<a class="salt-link" href="${link}">${url}</a>`
            },
            // roles/core/rc/files/periodic.conf

            dump: function (data) {
                if (data === null) {
                    return `<span class="null">NULL</span>`
                }

                if (typeof data === "string" && data.startsWith("salt://")) {
                    return this.resolveSaltLink(data)
                }

                if (this.isScalar(data)) {
                    return data
                }
                if (typeof data === "object") {
                    if (data.constructor.name === "Array") {
                        return this.dumpArray(data);
                    }

                    return this.dumpObject(data);
                }
            },

            dumpArray: function (values) {
                let dumped = '<ul class="state-list">'

                for (const value of values) {
                    dumped += `<li class="state-list-item">${this.dump(value)}</li>`
                }

                dumped += '</ul>'

                return dumped
            },

            dumpObject: function (data) {
                let dumped = ""

                for (const [key, value] of Object.entries(data)) {
                    dumped += `
    <div class="state-property">
        <span class="key">${key}</span>
        <span class="value">${this.dump(value)}</span>
    </div>
    `
                }

                return dumped
            },

            isScalar: value => typeof value === "boolean"
                || typeof value === "number"
                || typeof value === "string"
        };

        states.load(container, serverName, serverHost)

        return states;
    };

    /*  -------------------------------------------------------------
        Servers list
        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -    */

    const ServersList = function (container) {
        const serversList = {

            ///
            /// Constants
            ///

            SERVERS_API_URL: "https://api.nasqueron.org/infra/servers.json",

            ///
            /// Private properties
            ///

            /**
             * A JQuery selector expression to a DOM element to publish to.
             *
             * @var string
             */
            container: "",

            servers: undefined,

            ///
            /// Constructor
            ///

            /**
             * Initializes an instance of this object.
             *
             * @param container The DOM element JQuery selector where to write
             */
            load: function (container) {
                this.container = container;
                this.refreshData();
            },

            ///
            /// Data model
            ///

            fetchServers: function () {
                let that = this
                $.getJSON(this.SERVERS_API_URL, function (servers) {
                    that.servers = servers
                    that.refreshUI()
                })
            },

            refreshData: function () {
                this.fetchServers();
            },

            ///
            /// UI representation
            ///

            refreshUI: function () {
                $(this.container).html(this.formatData())

                for (const server of $(".server")) {
                    $(server).on("click", function () {
                        new States(container, server.id, server.dataset.hostname)
                    })
                }
            },

            formatData: function () {
                let output = '<h2>Servers</h2><ul class="servers">';
                for (const [server, properties] of Object.entries(this.servers)) {
                    if (properties.configurator !== "salt") {
                        continue;
                    }

                    output += `
    <li class="server" id="${server}" data-hostname="${properties.hostname}">
        <span class="server-property server-name">${properties.name}</span>
        <span class="server-property server-description">${properties.description}</span>
    </li>
    `
                }
                output += "</ul>"

                return output;
            }

        };

        serversList.load(container);

        return serversList;
    };

    /*  -------------------------------------------------------------
        Initialization
        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -    */

    new ServersList(container)
}

/*  -------------------------------------------------------------
    Code to run when document is ready
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -    */

$(document).ready(function() {
    new ServersConfig("#config");
});
