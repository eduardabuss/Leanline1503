

    //--------------------------------------------------------------------------
    //  DreamFactory 2.0 instance specific constants
    //--------------------------------------------------------------------------

    var INSTANCE_URL   = '';
    var APP_API_KEY     = '20a7c2966685d521d3f96fd89b165772425da658a7e53075dc78fe866acf1d32';



    //--------------------------------------------------------------------------
    //  Initializing app by selecting login page
    //--------------------------------------------------------------------------

    $('div[id^="template_"]').hide();
    $('#template_index').show();

    $.route('index');



    //--------------------------------------------------------------------------
    //  Login
    //--------------------------------------------------------------------------

    var loginHandle = function(response) {

        if(response.hasOwnProperty('session_token')) {
            setToken('token', response.session_token);
            $.route('restaurantes');
        }
        else {
            var msgObj = {};
            msgObj = parseResponse(response);
            if(msgObj) {
                messageBox(msgObj.code, msgObj.message, msgObj.error);
            }
        }
    };

    $('#signin').on('click', function () {
        var email = $('#email').val();
        var password = $('#password').val();

        $.api.login(email, password, loginHandle);
    });

    $('#register').on('click', function () {
        $.route('register');
    });



    //--------------------------------------------------------------------------
    //  Register
    //--------------------------------------------------------------------------

    $('#register_user').on('click', function () {
        var firstname = $('#register_firstname').val();
        var lastname = $('#register_lastname').val();
        var email = $('#register_email').val();
        var password = $('#register_password').val();

        $.api.register(firstname, lastname, email, password, function(response) {
            if(response.hasOwnProperty('session_token')) {
                setToken('token', response.session_token);
                $.route('restaurantes');
            }
            else {
                var msgObj = {};
                msgObj = parseResponse(response);
                if(msgObj) {
                    messageBox(msgObj.code, msgObj.message, msgObj.error);
                }
            }
        });
    });

    $('#register_cancel').on('click', function () {
        $.route('index');
    });



    //--------------------------------------------------------------------------
    //  Restaurantes
    //--------------------------------------------------------------------------

    var table = $('#table_restaurantes').DataTable({
        "paging":   false,
        "order": [
            [ 1, "asc" ]
        ],
        "info":     false,
        "columnDefs": [
            { "visible": false, "targets": 0 }
        ],
        "drawCallback": function ( settings ) {
            $("#table_restaurantes thead").remove();
            $("#table_restaurantes tfoot").remove();
        }

    });

    $('#table_restaurantes tbody').on( 'click', 'tr', function () {
        var restauranteId = $('#table_restaurantes').DataTable().row(this).data();
        $.route('restaurante/' + restauranteId[0]);
    } );

    var populateRestaurantesTable = function(data) {
        var _restaurantes = data;
        var restaurantes = [];

        if (data.hasOwnProperty('error')) {

            var response = parseResponse(data);
            messageBox(response.code, response.message, response.error);
        }
        else {
            $.each(_restaurantes, function (idRestaurante, restaurante) {
                restaurantes.push([
                    restaurante.idRestaurante,
                    restaurante.nomeRestaurante
                ])
            });

            $('#table_restaurantes').dataTable().fnClearTable();
            $('#table_restaurantes').dataTable().fnAddData(restaurantes);
            $('#table_restaurantes').dataTable().fnDraw();
        }
    };

    $('#table_restaurantes_search').keyup(function(){
        $('#table_restaurantes').DataTable().search($(this).val(), false, true).draw() ;
    });



    //--------------------------------------------------------------------------
    //  Group Create
    //--------------------------------------------------------------------------

    //--------------------------------------------------------------------------
    //  Group Show
    //--------------------------------------------------------------------------

    var tableRestaurante = $('#table_restaurante').DataTable({
        "paging":   false,
        "info":     false,
        "order": [
            [2, "asc" ],
            [3, "asc"],
            [1, "asc"]
        ],
        "columnDefs": [
            { "visible": false, "targets": 0 },
            { "visible": false, "targets": 2 },
            { "visible": false, "targets": 3 }
        ],

        "drawCallback": function () {
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last=null;

            api.column(2, {page:'current'} ).data().each( function ( restaurante, i ) {
                if ( last !== restaurante) {
                    $(rows).eq( i ).before(
                        '<tr class="restaurante info"><td colspan="4">'+restaurante+'</td></tr>'
                    );

                    last = restaurante;
                }
            } );

            $("#table_restaurante thead").remove();
            $("#table_restaurante tfoot").remove();
        }
    });

    var populateRestauranteShowName = function(data) {
        $('#restaurante_show_name').text(data[0].name);
    };


    var populateRestauranteTable = function(data) {
        var contacts = [];

        $.each(data, function(id, contact){
            contacts.push([
                contact.id,
                contact.first_name + ' ' + contact.last_name,
                contact.last_name.charAt(0).toUpperCase(),
                contact.last_name
            ])
        });

        $('#table_restaurante').dataTable().fnClearTable();
        $('#table_restaurante').dataTable().fnAddData(contacts);
        $('#table_restaurante').dataTable().fnDraw();
    };

    $('#table_restaurante tbody').on( 'click', 'tr', function () {
        var contactId = $('#table_restaurante').DataTable().row(this).data();

        if (contactId !== undefined)
            $.route('contact/' + contactId[0]);
    });

    $('#table_restaurante_search').keyup(function(){
        $('#table_restaurante').DataTable().search($(this).val(), false, true).draw() ;
    });



    //--------------------------------------------------------------------------
    //  Group Edit
    //--------------------------------------------------------------------------

   
    //--------------------------------------------------------------------------
    //  Contact Create
    //--------------------------------------------------------------------------

    


    //--------------------------------------------------------------------------
    //  Contact Show
    //--------------------------------------------------------------------------

    var populateContact = function(data) {
        $('#contact_firstName').text(data.first_name);
        $('#contact_lastName').text(data.last_name);
        $('#contact_notes').text(data.notes);
        $('#contact_social').empty();

        if (data.twitter) {
            $('#contact_social').append('<img src="img/twitter2.png" height="25">&nbsp;&nbsp;' +
            data.twitter + '<br><br>');
        }

        if (data.skype) {
            $('#contact_social').append('<img src="img/skype.png" height="25">&nbsp;&nbsp;' +
            data.skype + '<br><br>');
        }
    };

    var populateContactInfo = function(data) {
        var types = '';

        $('#contact_info_types').empty();

        $.each(data, function(index, value) {
            types += '<br><div class="infobox">';
            types += '<h4>' + value.info_type.charAt(0).toUpperCase() + value.info_type.slice(1) + '</h4>';
            types += '<div class="col-md-12">';
            types += '<div class="col-md-1">&nbsp;</div>';
            types += '<div class="col-md-1"><div style="height: 25px"><img src="img/phone.png" height="25"></div><br><img src="img/mail.png" height="25"></div>';
            types += '<div class="col-md-4"><div style="height: 25px">' + value.phone + '</div><br>' + value.email + '</div>';
            types += '<div class="col-md-1"><img src="img/home.png" height="25"></div>';
            types += '<div class="col-md-4">' + value.address + '<br>' + value.city + ', ' + value.state + ' ' + value.zip + '<br>' + value.country + '</div>';
            types += '<div class="col-md-1">&nbsp;</div>';
            types += '</div>';
            types += '</div>';
        });

        $('#contact_info_types').append(types);
    };

    //--------------------------------------------------------------------------
    //  Contact Edit
    //--------------------------------------------------------------------------


    //--------------------------------------------------------------------------
    //  Misc functions
    //--------------------------------------------------------------------------

    function setToken(key, value) {
        sessionStorage.setItem(key, value);
    }

    function getToken(key) {
        return sessionStorage.getItem(key);
    }

    function removeToken(key) {

        $.api.logout(function(data) {
            if(data.success) {
                sessionStorage.removeItem(key);
                $.route('index');
            }
            else {
                var response = parseResponse(data);
                messageBox(response.code, response.message, response.error);
            }
        });
    }

    function clearForm() {
        $('input').each(function(){
            $(this).val('');
        });
    }

    function messageBox(title, body, error) {
        $('#modal_title').html(title);
        $('#modal_body').html(body);
        $('#errorMsg').html(error);
        $('#messageBox').modal('show');
    }

    function parseResponse(response) {
        var responseObj = jQuery.parseJSON( response.responseText );

        if (responseObj.hasOwnProperty('error')) {
            if(responseObj.error.context !== null) {
                var errMsg = '';

                $.each(responseObj.error.context, function(data){
                    errMsg += '<br> - ' + responseObj.error.context[data][0].replace(/&quot;/g, '\"');
                });

                var message = responseObj.error.message + '<br>' + errMsg;
                return {code: responseObj.error.code, message: message, error: JSON.stringify(response)};
            }
            else {
                return {code: responseObj.error.code, message: responseObj.error.message.replace(/&quot;/g, '\"'), error: JSON.stringify(response)};
            }
        }
        else {
            return false;
        }
    }










