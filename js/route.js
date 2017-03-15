

(function($) {

    $.extend({

        route: function(path) {

            var previousUrl = window.location.hash.slice(1);
            window.location.hash = '#' + path;

            var pathArray = path.split('/');

            $('div[id^="template_"]').hide();
            $('button[id^="menu_"]').hide();

             var routes = [
                 {id: 1,     name: 'index',          regex: '(index)'                           },  // index
                 {id: 2,     name: 'register',       regex: '(register)'                        },  // register
                 {id: 3,     name: 'restaurantes',         regex: '(restaurantes)'                          },  // groups

                 {id: 5,     name: 'restaurante_show',     regex: '(restaurante).*?(\\d+)'                  },  // group/{:id}


                 {id: 8,     name: 'contact_show',   regex: '(contact).*?(\\d+)$'               },  // contact/{:id}

             ];

            var route       = 0;
            var template    = null;

            $.each(routes, function(){
                var test = new RegExp(this.regex);

                if (test.test(path)) {
                    route = this.id;
                    template = this.name;
                }
            });

            //Logout button
            $('#' + template + '_menu_logout').on('click', function () {
                removeToken('token');
            });

            switch (template) {

                case 'index':
                    break;

                case 'register':
                    break;

                case 'restaurantes':
                    setButton('left', template, 'index', 'redirect', null);

                    $.api.getRecords('restaurante', null, getToken('token'), populateRestaurantesTable);
                    break;

                case 'restaurante_show':
                    setButton('left', template, 'restaurantes', 'redirect', null);
                    setButton('plus', template, 'contact/' + pathArray[1] + '/create', 'redirect', null);
                    setButton('right', template, 'restaurante/' + pathArray[1] + '/edit', 'redirect', null);

                    var params = 'filter=id%3D' + pathArray[1] + '&fields=nomeRestaurante';
                    $.api.getRecords('contact_restaurante', params, getToken('token'), populateRestauranteShowName);

                    params = 'filter=contact_restaurante_id%3D' + pathArray[1] + '&fields=idRestaurante';
                    
                    // I'm not sure if I should keep this next line, because the example I based the code has a relationship between each contact and group, 
                    // but with what I want to do is that each product belongs to one restaurant.
                    
                    
                    $.api.getRecords('contact_group_relationship', params, getToken('token'), function(data){
                        var contacts = [];
                        $('#table_restaurante').dataTable().fnClearTable();

                        $.each(data, function(id, contact){
                            contacts.push(contact.contact_id);
                        });

                        if(contacts.length) {
                            var params = 'ids=' + contacts.toString();
                            $.api.getRecords('contact', params, getToken('token'), populateRestauranteTable);
                        }
                    });
                    break;

                case 'contact_show':
                    var restauranteId = $('#contact_edit_restaurante').val();

                    setButton('left', template, 'restaurante/' + restauranteId, 'redirect', null);
                    setButton('right', template, 'contact/' + pathArray[1] + '/edit', 'redirect', null);

                    $('#contact_show_menu_delete').off().on('click', function(){
                        deleteContact(pathArray[1], previousUrl);
                    });

                    var params = 'filter=contact_id%3D' + pathArray[1];
                    $.api.getRecords('contact/' + pathArray[1], null, getToken('token'), populateContact);
                    $.api.getRecords('contact_info', params, getToken('token'), populateContactInfo);

                    var urlParts = previousUrl.split('/');
                    $('#contact_edit_restaurante').val(urlParts[1]);
                    break;
            }

            $('#template_' + template).show();
        }
    });


    function setButton(button, page, url, type, func) {
        switch (type) {
            case 'redirect':
                $('#' + page + '_menu_' + button).off().on('click', function(){
                    $.route(url);
                });
                break;
        }
    }



}(jQuery));